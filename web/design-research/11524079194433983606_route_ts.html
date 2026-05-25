import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Create client inside handler to avoid build-time env var access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )


  try {
    const body = await request.json()

    // Verify the webhook signature (Persona sends X-Persona-Signature header)
    // In production, you should validate this against your Persona webhook secret
    // const signature = request.headers.get('X-Persona-Signature')

    const { data } = body
    const eventType = data?.attributes?.['event-type']

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
      case 'inquiry.completed':
        status = 'APPROVED'
        personaStatus = 'completed'
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
