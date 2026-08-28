import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const url = new URL('/login', request.url)
  const response = NextResponse.redirect(url, 303)
  response.cookies.delete('gigtim_session')
  return response
}

export async function GET(request: NextRequest) {
  const url = new URL('/login', request.url)
  const response = NextResponse.redirect(url, 303)
  response.cookies.delete('gigtim_session')
  return response
}
