'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Helpers ────────────────────────────────────────────────

async function getAuthUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

async function getDbUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()
  return data
}

// ─── JOBS / MARKETPLACE ─────────────────────────────────────

export async function getOpenShifts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_shifts')
    .select('*, employer_profiles(company_name, city, county)')
    .eq('status', 'OPEN')
    .order('start_time', { ascending: true })

  if (error) { console.error('getOpenShifts:', error); return [] }
  return data || []
}

export async function applyToShift(shiftId: string) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser || dbUser.role !== 'WORKER') return { error: 'Trebuie să fii lucrător pentru a aplica.' }

  const { error } = await supabase
    .from('applications')
    .insert({ shift_id: shiftId, worker_id: dbUser.id })

  if (error) {
    if (error.code === '23505') return { error: 'Ai aplicat deja la această tură.' }
    return { error: error.message }
  }
  revalidatePath('/jobs')
  revalidatePath('/applications')
  return { success: true }
}

// ─── SHIFTS ─────────────────────────────────────────────────

export async function getMyShifts() {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return []

  if (dbUser.role === 'EMPLOYER') {
    const { data } = await supabase
      .from('job_shifts')
      .select('*, applications(count)')
      .eq('employer_id', dbUser.id)
      .order('created_at', { ascending: false })
    return data || []
  }

  // Workers: shifts they've applied to
  const { data: apps } = await supabase
    .from('applications')
    .select('shift_id, status, job_shifts(*, employer_profiles(company_name, city))')
    .eq('worker_id', dbUser.id)
    .order('created_at', { ascending: false })

  return (apps || []).map(a => ({
    ...a.job_shifts,
    my_application_status: a.status,
  }))
}

export async function createShift(formData: FormData) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser || dbUser.role !== 'EMPLOYER') return { error: 'Doar angajatorii pot crea ture.' }

  const { error } = await supabase.from('job_shifts').insert({
    employer_id: dbUser.id,
    role_needed: formData.get('role_needed') as string,
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    hourly_pay_ron: Number(formData.get('hourly_pay_ron')),
  })

  if (error) return { error: error.message }
  revalidatePath('/shifts')
  return { success: true }
}

// ─── APPLICATIONS ───────────────────────────────────────────

export async function getMyApplications() {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return []

  if (dbUser.role === 'WORKER') {
    // Workers see their own applications with shift + employer info
    const { data } = await supabase
      .from('applications')
      .select('*, job_shifts(*, employer_profiles(company_name, city))')
      .eq('worker_id', dbUser.id)
      .order('created_at', { ascending: false })
    return data || []
  }

  if (dbUser.role === 'EMPLOYER') {
    // Employers see applications for their shifts with worker info
    const { data: shifts } = await supabase
      .from('job_shifts')
      .select('id')
      .eq('employer_id', dbUser.id)

    if (!shifts || shifts.length === 0) return []
    const shiftIds = shifts.map(s => s.id)

    const { data } = await supabase
      .from('applications')
      .select('*, job_shifts(role_needed, start_time, end_time, hourly_pay_ron), worker_profiles(full_name, phone_number, city, cnp, id_card_series, reliability_score, total_shifts_completed, skills)')
      .in('shift_id', shiftIds)
      .order('created_at', { ascending: false })
    return data || []
  }

  return []
}

export async function updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) return { error: error.message }
  revalidatePath('/applications')
  return { success: true }
}

// ─── FORUM ──────────────────────────────────────────────────

export async function getForumPosts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forum_posts')
    .select('*, forum_comments(count)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) { console.error('getForumPosts:', error); return [] }

  // Get author names
  if (!data || data.length === 0) return []
  const authorIds = [...new Set(data.map(p => p.author_id))]
  
  const { data: workers } = await supabase
    .from('worker_profiles')
    .select('user_id, full_name')
    .in('user_id', authorIds)
  const { data: employers } = await supabase
    .from('employer_profiles')
    .select('user_id, company_name')
    .in('user_id', authorIds)

  return data.map(post => {
    const worker = workers?.find(w => w.user_id === post.author_id)
    const employer = employers?.find(e => e.user_id === post.author_id)
    return {
      ...post,
      author_name: worker?.full_name || employer?.company_name || 'Utilizator',
      comment_count: post.forum_comments?.[0]?.count || 0,
    }
  })
}

export async function createForumPost(formData: FormData) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return { error: 'Neautorizat' }

  const { error } = await supabase.from('forum_posts').insert({
    author_id: dbUser.id,
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    category: formData.get('category') as string,
  })

  if (error) return { error: error.message }
  revalidatePath('/forum')
  return { success: true }
}

export async function getForumComments(postId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (!data || data.length === 0) return []
  const authorIds = [...new Set(data.map(c => c.author_id))]

  const { data: workers } = await supabase
    .from('worker_profiles')
    .select('user_id, full_name')
    .in('user_id', authorIds)
  const { data: employers } = await supabase
    .from('employer_profiles')
    .select('user_id, company_name')
    .in('user_id', authorIds)

  return data.map(c => ({
    ...c,
    author_name: workers?.find(w => w.user_id === c.author_id)?.full_name
      || employers?.find(e => e.user_id === c.author_id)?.company_name
      || 'Utilizator',
  }))
}

export async function createForumComment(postId: string, content: string) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return { error: 'Neautorizat' }

  const { error } = await supabase.from('forum_comments').insert({
    post_id: postId,
    author_id: dbUser.id,
    content,
  })

  if (error) return { error: error.message }
  revalidatePath('/forum')
  return { success: true }
}

// ─── CHAT ───────────────────────────────────────────────────

export async function getChatRooms() {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return []

  // Get rooms user is a member of
  const { data: memberships } = await supabase
    .from('chat_room_members')
    .select('room_id')
    .eq('user_id', dbUser.id)

  if (!memberships || memberships.length === 0) return []
  const roomIds = memberships.map(m => m.room_id)

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('*')
    .in('id', roomIds)

  if (!rooms) return []

  // Get last message for each room
  const result = await Promise.all(rooms.map(async (room) => {
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('content, created_at, sender_id')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastMsg = msgs?.[0] || null
    return {
      ...room,
      last_message: lastMsg?.content || null,
      last_message_at: lastMsg?.created_at || room.created_at,
      last_sender_is_me: lastMsg?.sender_id === dbUser.id,
    }
  }))

  return result.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
}

export async function getChatMessages(roomId: string) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return []

  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (!data) return []

  // Get sender names
  const senderIds = [...new Set(data.map(m => m.sender_id))]
  const { data: workers } = await supabase.from('worker_profiles').select('user_id, full_name').in('user_id', senderIds)
  const { data: employers } = await supabase.from('employer_profiles').select('user_id, company_name').in('user_id', senderIds)

  return data.map(m => ({
    ...m,
    sender_name: workers?.find(w => w.user_id === m.sender_id)?.full_name
      || employers?.find(e => e.user_id === m.sender_id)?.company_name
      || 'Utilizator',
    is_mine: m.sender_id === dbUser.id,
  }))
}

export async function sendChatMessage(roomId: string, content: string) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return { error: 'Neautorizat' }

  const { error } = await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: dbUser.id,
    content,
  })

  if (error) return { error: error.message }
  return { success: true }
}

// ─── ADMIN ──────────────────────────────────────────────────

export async function getAdminAuditLog() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return data || []
}

export async function getAdminVerifications() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('id_verifications')
    .select('*, worker_profiles(full_name, city)')
    .order('created_at', { ascending: false })

  return data || []
}

// ─── PROFILE UPDATE ─────────────────────────────────────────

export async function updateWorkerProfile(formData: FormData) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return { error: 'Neautorizat' }

  // Use upsert to handle legacy users who might not have a profile row
  const { error } = await supabase
    .from('worker_profiles')
    .upsert({
      user_id: dbUser.id,
      full_name: formData.get('full_name') as string,
      phone_number: formData.get('phone_number') as string,
      city: formData.get('city') as string,
      county: formData.get('county') as string,
      bio: formData.get('bio') as string,
      // Default ITM values for legacy updates
      cnp: '0000000000000',
      id_card_series: 'XX000000',
    }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function updateEmployerProfile(formData: FormData) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return { error: 'Neautorizat' }

  const { error } = await supabase
    .from('employer_profiles')
    .upsert({
      user_id: dbUser.id,
      company_name: formData.get('company_name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      county: formData.get('county') as string,
      cui: 'RO000000', // Default for legacy updates
    }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function getUserReviews(userId: string) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, reviewer_id, reviewer:users!reviewer_id(role)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })

  if (!reviews || reviews.length === 0) return []

  // Fetch reviewer names
  const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))]
  
  const { data: workers } = await supabase.from('worker_profiles').select('user_id, full_name').in('user_id', reviewerIds)
  const { data: employers } = await supabase.from('employer_profiles').select('user_id, company_name').in('user_id', reviewerIds)

  return reviews.map(r => {
    let reviewerName = 'Utilizator'
    if (r.reviewer?.role === 'WORKER') {
      reviewerName = workers?.find(w => w.user_id === r.reviewer_id)?.full_name || 'Utilizator'
    } else {
      reviewerName = employers?.find(e => e.user_id === r.reviewer_id)?.company_name || 'Angajator'
    }
    return {
      ...r,
      reviewer_name: reviewerName
    }
  })
}
