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

  redirect('/jobs')
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
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const adminClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userData, error: insertError } = await adminClient.from('users').insert({
      auth_id: authData.user.id,
      role,
    }).select('id').single()

    if (insertError || !userData) {
      return { error: insertError?.message || 'Failed to create user record' }
    }

    const userId = userData.id

    // Insert into respective profile table
    const city = formData.get('city') as string || ''
    const county = formData.get('county') as string || ''

    if (role === 'WORKER') {
      const fullName = formData.get('fullName') as string || ''
      const phone = formData.get('phone') as string || ''
      const cnp = formData.get('cnp') as string || ''
      const idSeries = formData.get('idSeries') as string || ''

      await adminClient.from('worker_profiles').insert({
        user_id: userId,
        full_name: fullName,
        phone_number: phone,
        city,
        county,
        cnp,
        id_card_series: idSeries
      })
    } else if (role === 'EMPLOYER') {
      const companyName = formData.get('companyName') as string || ''
      const cui = formData.get('cui') as string || ''
      const address = formData.get('address') as string || ''

      await adminClient.from('employer_profiles').insert({
        user_id: userId,
        company_name: companyName,
        cui,
        address,
        city,
        county
      })
    }
  }

  return { success: true }
}

export async function resendConfirmation(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
export async function resetPassword(email: string) {
  const supabase = await createClient()
  
  // Create a URL for the callback route, which will redirect to the update-password page
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
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

  const email = authUser.email || null

  if (dbUser.role === 'WORKER') {
    const { data: profile } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .single()
    return { user: dbUser, profile, profileType: 'worker' as const, email }
  }

  if (dbUser.role === 'EMPLOYER') {
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .single()
    return { user: dbUser, profile, profileType: 'employer' as const, email }
  }

  return { user: dbUser, profile: null, profileType: 'admin' as const, email }
}

export async function getAdminUsers() {
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Get all auth users
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()
  if (authError || !authData) {
    return []
  }

  // 2. Get all public users
  const { data: dbUsers } = await adminClient.from('users').select('*')
  
  // 3. Get all profiles
  const { data: workers } = await adminClient.from('worker_profiles').select('*')
  const { data: employers } = await adminClient.from('employer_profiles').select('*')

  if (!dbUsers) return []

  // 4. Merge
  return dbUsers.map(dbUser => {
    const authUser = authData.users.find(u => u.id === dbUser.auth_id)
    const workerProfile = workers?.find(w => w.user_id === dbUser.id)
    const employerProfile = employers?.find(e => e.user_id === dbUser.id)

    let name = 'Admin User'
    let city = '—'
    let verified = false

    if (dbUser.role === 'WORKER' && workerProfile) {
      name = workerProfile.full_name
      city = workerProfile.city
      verified = workerProfile.id_verified
    } else if (dbUser.role === 'EMPLOYER' && employerProfile) {
      name = employerProfile.company_name
      city = employerProfile.city
      verified = employerProfile.company_verified
    }

    return {
      id: dbUser.id,
      email: authUser?.email || 'unknown',
      role: dbUser.role,
      name,
      city,
      verified,
      created: new Date(dbUser.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  })
}

export async function updateUserAvatar(avatarUrl: string) {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return { error: 'Neautorizat' }

  const { error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('auth_id', authUser.id)

  if (error) return { error: error.message }
  return { success: true }
}
