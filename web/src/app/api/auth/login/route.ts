import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbPool } from '@/lib/romarg-db'

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days — keeps the session alive across browser restarts; only logout clears it

function sessionCookieValue(userId: string, email: string, role: string) {
  return JSON.stringify({ userId, email, role })
}

function buildSetCookieHeader(value: string): string {
  const encoded = encodeURIComponent(value)
  const isProd = process.env.NODE_ENV === 'production'
  const secure = isProd ? '; Secure' : ''
  return `gigtim_session=${encoded}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${secure}; HttpOnly`
}

export async function POST(request: NextRequest) {
  let email = ''
  let password = ''
  let wantsRedirect = false

  const contentType = request.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      const body = await request.json()
      email = (body?.email ?? '').toString().trim().toLowerCase()
      password = (body?.password ?? '').toString()
      wantsRedirect = body?.redirect === true
    } else {
      const form = await request.formData()
      email = (form.get('email') ?? '').toString().trim().toLowerCase()
      password = (form.get('password') ?? '').toString()
      wantsRedirect = true
    }
  } catch {
    return NextResponse.json({ error: 'Corpul cererii este invalid.' }, { status: 400 })
  }

  if (!email || !password) {
    if (wantsRedirect) {
      const url = new URL('/login', request.url)
      url.searchParams.set('error', 'Emailul și parola sunt obligatorii.')
      return NextResponse.redirect(url, 303)
    }
    return NextResponse.json({ error: 'Emailul și parola sunt obligatorii.' }, { status: 400 })
  }

  try {
    const connection = await dbPool.getConnection()
    try {
      const [rows] = await connection.query<any[]>(
        'SELECT id, email, password_hash, role, email_verified FROM users WHERE email = ?',
        [email]
      )

      if (rows.length === 0) {
        return fail(request, wantsRedirect, 'Email sau parolă incorectă.')
      }

      const user = rows[0]
      const valid = await bcrypt.compare(password, user.password_hash)
      if (!valid) {
        return fail(request, wantsRedirect, 'Email sau parolă incorectă.')
      }

      if (!user.email_verified) {
        return fail(
          request,
          wantsRedirect,
          'Adresa ta de email nu a fost încă verificată. Te rugăm să apeși pe link-ul primit în inbox.'
        )
      }

      const value = sessionCookieValue(user.id, user.email, user.role)

      if (wantsRedirect) {
        const url = new URL('/shifts', request.url)
        const response = NextResponse.redirect(url, { status: 303, headers: { 'Set-Cookie': buildSetCookieHeader(value) } })
        return response
      }

      const response = NextResponse.json({ success: true, user: { id: user.id, role: user.role } })
      response.headers.append('Set-Cookie', buildSetCookieHeader(value))
      return response
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('ROMARG login route error:', error)
    if (wantsRedirect) {
      const url = new URL('/login', request.url)
      url.searchParams.set('error', 'Eroare la autentificare pe server.')
      return NextResponse.redirect(url, 303)
    }
    return NextResponse.json(
      { error: 'Eroare la autentificare pe server: ' + (error?.message || 'eroare necunoscută') },
      { status: 500 }
    )
  }
}

function fail(request: NextRequest, wantsRedirect: boolean, message: string) {
  if (wantsRedirect) {
    const url = new URL('/login', request.url)
    url.searchParams.set('error', message)
    return NextResponse.redirect(url, 303)
  }
  return NextResponse.json({ error: message }, { status: 401 })
}
