'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/shifts')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as UserRole) || 'WORKER'

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    const { error: insertError } = await supabase.from('users').insert({
      auth_id: authData.user.id,
      role,
    })

    if (insertError) {
      return { error: insertError.message }
    }
  }

  redirect('/shifts')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()

  return dbUser
}

export async function getCurrentProfile() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()

  if (!dbUser) return null

  if (dbUser.role === 'WORKER') {
    const { data: profile } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .single()
    return { user: dbUser, profile, profileType: 'worker' as const }
  }

  if (dbUser.role === 'EMPLOYER') {
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .single()
    return { user: dbUser, profile, profileType: 'employer' as const }
  }

  return { user: dbUser, profile: null, profileType: 'admin' as const }
}
