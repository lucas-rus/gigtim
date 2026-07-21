import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Verifies the Persona-Signature header against the raw request body.
 *
 * Persona's scheme (per docs.withpersona.com/quickstart-webhooks):
 *   header format:  "t=<unix_ts>,v1=<hex_sig>[,v1=<hex_sig>...]"
 *   signed payload: `${timestamp}.${rawBody}` (concatenated with a dot)
 *   algorithm:      HMAC-SHA256 with the webhook secret, hex digest
 *
 * Fail-closed: rejects if no secret, no/invalid signature, or stale timestamp
 * (>5 min skew = replay attempt).
 */
async function verifySignature(rawBody: string, header: string | null): Promise<boolean> {
  const secret = process.env.PERSONA_WEBHOOK_SECRET
  if (!secret) {
    console.error('PERSONA_WEBHOOK_SECRET is not configured — rejecting webhook.')
    return false
  }
  if (!header) return false

  // Parse "t=<ts>,v1=<sig>" pairs.
  const pairs = header.split(',').map(p => p.trim())
  const tPair = pairs.find(p => p.startsWith('t='))
  const v1Pairs = pairs.filter(p => p.startsWith('v1='))
  if (!tPair || v1Pairs.length === 0) return false

  const timestamp = Number(tPair.slice(2))
  if (!Number.isFinite(timestamp)) return false

  // Replay protection: reject if older than 5 minutes.
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex')
  return v1Pairs.some(v1 => {
    const sig = v1.slice(3)
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(sig, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  })
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const rawBody = await request.text()

    // Verify the webhook signature BEFORE trusting any payload.
    const signature = request.headers.get('persona-signature')
    if (!(await verifySignature(rawBody, signature))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { data } = body
    // Persona puts the event name in data.attributes.name (e.g. "inquiry.approved").
    const eventType = data?.attributes?.name

    if (!eventType) {
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
    }

    const inquiryId = data?.attributes?.payload?.data?.id
    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 })
    }

    let status: string
    let personaStatus: string = ''

    switch (eventType) {
      case 'inquiry.approved':
      case 'inquiry.completed':
        status = 'APPROVED'
        personaStatus = eventType === 'inquiry.approved' ? 'approved' : 'completed'
        break
      case 'inquiry.failed':
        status = 'REJECTED'
        personaStatus = 'failed'
        break
      case 'inquiry.expired':
        status = 'EXPIRED'
        personaStatus = 'expired'
        break
      case 'inquiry.marked-for-review':
        status = 'NEEDS_REVIEW'
        personaStatus = 'marked-for-review'
        break
      default:
        // Other event types (created, started, etc.) — update persona_status only
        status = 'PENDING'
        personaStatus = eventType.replace('inquiry.', '')
    }

    const updateData: Record<string, unknown> = {
      status,
      persona_status: personaStatus,
      updated_at: new Date().toISOString(),
    }

    if (status === 'APPROVED') {
      updateData.verified_at = new Date().toISOString()
    }

    // Extract rejection reasons if present
    const failedChecks = data?.attributes?.payload?.data?.attributes?.['failed-checks']
    if (failedChecks && Array.isArray(failedChecks)) {
      updateData.rejection_reasons = failedChecks.map(
        (check: { name: string; reason: string }) => `${check.name}: ${check.reason}`
      )
    }

    const { error } = await supabase
      .from('id_verifications')
      .update(updateData)
      .eq('persona_inquiry_id', inquiryId)

    if (error) {
      console.error('Failed to update verification:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Persona webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
