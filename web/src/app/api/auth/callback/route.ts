import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // "next" is the intended redirect after exchanging the code
  // If not provided, we default to the dashboard (or root)
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful code exchange, redirect to the desired page
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // Code exchange failed
      console.error('Auth callback error:', error.message)
      // We can redirect to an error page or login with an error query param
      return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
    }
  }

  // No code provided, fallback
  return NextResponse.redirect(`${origin}/login`)
}
