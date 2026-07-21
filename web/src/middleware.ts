import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('gigtim_session')?.value
  const { pathname } = request.nextUrl

  const isProtectedPage =
    pathname.startsWith('/shifts') ||
    pathname.startsWith('/jobs') ||
    pathname.startsWith('/applications') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/forum') ||
    pathname.startsWith('/admin')

  // Only redirect away from protected pages if no session cookie exists
  if (isProtectedPage && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
