'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidCNP, isValidCUI, isValidRole, isValidMessageBody } from '@/lib/validation'

// ─── Helpers ────────────────────────────────────────────────

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

/** Verifies the current user is a member of the given chat room. */
async function isRoomMember(supabase: Awaited<ReturnType<typeof createClient>>, roomId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('chat_room_members')
    .select('room_id')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

// ─── JOBS / MARKETPLACE ─────────────────────────────────────

export async function getOpenShifts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_shifts')
    .select('*, employer_profiles(company_name, city, county)')
    .eq('status', 'OPEN')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('getOpenShifts error:', error.message, 'Code:', error.code, 'Details:', error.details, 'Hint:', error.hint)
    return []
  }
  return data || []
}

export async function applyToShift(shiftId: string) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser || dbUser.role !== 'WORKER') return { error: 'Trebuie să fii lucrător pentru a aplica.' }

  // Identity verification gate: worker must have CNP + Serie CI on file
  // (conform Legea 52/2011 — Registrul Zilierilor ITM)
  const { data: workerProfile } = await supabase
    .from('worker_profiles')
    .select('cnp, id_card_series')
    .eq('user_id', dbUser.id)
    .maybeSingle()
  if (!workerProfile?.cnp || !workerProfile?.id_card_series) {
    return { error: 'Verifică-ți identitatea în profil (CNP + Serie CI) pentru a aplica la ture.' }
  }

  // Verify the shift is still OPEN (defense-in-depth; RLS also guards this).
  const { data: shift, error: shiftError } = await supabase
    .from('job_shifts')
    .select('status')
    .eq('id', shiftId)
    .maybeSingle()

  if (shiftError || !shift) return { error: 'Tura nu a fost găsită.' }
  if (shift.status !== 'OPEN') return { error: 'Această tură nu mai acceptă aplicări.' }

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

  const roleNeeded = (formData.get('role_needed') as string) || ''
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const hourlyPay = Number(formData.get('hourly_pay_ron'))

  if (!isValidRole(roleNeeded)) return { error: 'Rolul necesar este invalid.' }
  if (!startTime || !endTime) return { error: 'Timpul de început și de sfârșit sunt obligatorii.' }
  if (new Date(endTime) <= new Date(startTime)) return { error: 'Timpul de sfârșit trebuie să fie după cel de început.' }
  if (!Number.isFinite(hourlyPay) || hourlyPay <= 0) return { error: 'Plata pe oră trebuie să fie mai mare decât zero.' }

  const { error } = await supabase.from('job_shifts').insert({
    employer_id: dbUser.id,
    role_needed: roleNeeded,
    start_time: startTime,
    end_time: endTime,
    hourly_pay_ron: hourlyPay,
  })

  if (error) return { error: error.message }
  revalidatePath('/shifts')
  revalidatePath('/jobs')
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
      .select('*, job_shifts(role_needed, start_time, end_time, hourly_pay_ron), worker_profiles(user_id, full_name, phone_number, city, cnp, id_card_series, reliability_score, total_shifts_completed, skills, users(avatar_url))')
      .in('shift_id', shiftIds)
      .order('created_at', { ascending: false })
    return data || []
  }

  return []
}

export async function updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser || dbUser.role !== 'EMPLOYER') return { error: 'Doar angajatorii pot actualiza aplicările.' }
  if (status !== 'ACCEPTED' && status !== 'REJECTED') return { error: 'Status invalid.' }

  // Verify the caller owns the shift this application belongs to.
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('shift_id, job_shifts!inner(employer_id)')
    .eq('id', applicationId)
    .maybeSingle()

  if (appError || !application) return { error: 'Aplicarea nu a fost găsită.' }
  const shiftOwner = (application.job_shifts as any)?.employer_id
  if (shiftOwner !== dbUser.id) return { error: 'Nu ești autorizat să modifici această aplicare.' }

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

  if (error) {
    console.error('getForumPosts error:', error.message, 'Code:', error.code, 'Details:', error.details, 'Hint:', error.hint)
    return []
  }

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

  const title = ((formData.get('title') as string) || '').trim()
  const content = ((formData.get('content') as string) || '').trim()
  const category = (formData.get('category') as string) || 'GENERAL'

  if (title.length < 3) return { error: 'Titlul trebuie să aibă minim 3 caractere.' }
  if (title.length > 120) return { error: 'Titlul este prea lung (max 120).' }
  if (!content || content.length > 5000) return { error: 'Conținutul este invalid (max 5000 caractere).' }
  if (!['GENERAL', 'TIPS', 'JOBS', 'LEGAL'].includes(category)) return { error: 'Categorie invalidă.' }

  const { error } = await supabase.from('forum_posts').insert({
    author_id: dbUser.id,
    title,
    content,
    category,
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

  if (!isValidMessageBody(content, 2000)) return { error: 'Comentariul este invalid.' }

  const { error } = await supabase.from('forum_comments').insert({
    post_id: postId,
    author_id: dbUser.id,
    content: content.trim(),
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

  // Verify the caller is a member of this room.
  if (!(await isRoomMember(supabase, roomId, dbUser.id))) return []

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

  if (!isValidMessageBody(content)) return { error: 'Mesajul nu poate fi gol.' }

  // Verify the caller is a member of this room.
  if (!(await isRoomMember(supabase, roomId, dbUser.id))) {
    return { error: 'Nu ești membru al acestei conversații.' }
  }

  const { error } = await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: dbUser.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }
  return { success: true }
}

// ─── ADMIN ──────────────────────────────────────────────────

export async function getAdminAuditLog() {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser || dbUser.role !== 'ADMIN') return []

  const { data } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return data || []
}

export async function getAdminVerifications() {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser || dbUser.role !== 'ADMIN') return []

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
  if (!dbUser || dbUser.role !== 'WORKER') return { error: 'Doar lucrătorii pot edita profilul de lucrător.' }

  // Preserve existing CNP/CI if the user doesn't resubmit them; never store
  // placeholder PII — reject if neither new nor existing value is valid.
  const { data: existing } = await supabase
    .from('worker_profiles')
    .select('cnp, id_card_series')
    .eq('user_id', dbUser.id)
    .maybeSingle()

  const cnp = ((formData.get('cnp') as string) || '').trim() || existing?.cnp || ''
  const id_card_series = ((formData.get('id_card_series') as string) || '').trim() || existing?.id_card_series || ''

  if (!isValidCNP(cnp)) return { error: 'CNP-ul trebuie să conțină exact 13 cifre.' }
  if (!id_card_series) return { error: 'Seria cărții de identitate este obligatorie.' }

  const { error } = await supabase
    .from('worker_profiles')
    .upsert({
      user_id: dbUser.id,
      full_name: formData.get('full_name') as string,
      phone_number: formData.get('phone_number') as string,
      city: formData.get('city') as string,
      county: formData.get('county') as string,
      bio: formData.get('bio') as string,
      cnp,
      id_card_series,
    }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function updateEmployerProfile(formData: FormData) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser || dbUser.role !== 'EMPLOYER') return { error: 'Doar angajatorii pot edita profilul de angajator.' }

  const { data: existing } = await supabase
    .from('employer_profiles')
    .select('cui')
    .eq('user_id', dbUser.id)
    .maybeSingle()

  const cui = ((formData.get('cui') as string) || '').trim() || existing?.cui || ''
  if (!isValidCUI(cui)) return { error: 'CUI-ul este invalid. Ex: RO12345678.' }

  const { error } = await supabase
    .from('employer_profiles')
    .upsert({
      user_id: dbUser.id,
      company_name: formData.get('company_name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      county: formData.get('county') as string,
      cui,
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
    const reviewerObj: any = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer
    if (reviewerObj?.role === 'WORKER') {
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

export async function getOrCreateDirectChat(targetUserId: string) {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return { error: 'Neautorizat' }
  if (!targetUserId) return { error: 'Destinatar invalid.' }
  if (targetUserId === dbUser.id) return { error: 'Nu poți începe o conversație cu tine însuți.' }

  // 1. Check if a DIRECT room already exists between these two users
  const { data: myRooms } = await supabase
    .from('chat_room_members')
    .select('room_id')
    .eq('user_id', dbUser.id)

  const { data: targetRooms } = await supabase
    .from('chat_room_members')
    .select('room_id')
    .eq('user_id', targetUserId)

  let existingRoomId: string | null = null

  if (myRooms && targetRooms) {
    const myRoomIds = myRooms.map(r => r.room_id)
    const targetRoomIds = targetRooms.map(r => r.room_id)
    const commonRoomIds = myRoomIds.filter(id => targetRoomIds.includes(id))

    if (commonRoomIds.length > 0) {
      // Find if any of these common rooms is a DIRECT room
      const { data: directRooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .in('id', commonRoomIds)
        .eq('type', 'DIRECT')

      if (directRooms && directRooms.length > 0) {
        existingRoomId = directRooms[0].id
      }
    }
  }

  if (existingRoomId) {
    return { roomId: existingRoomId }
  }

  // 2. Otherwise, create a new DIRECT room.
  // Find names for room name fallback (maybeSingle avoids errors when missing).
  const { data: worker } = await supabase.from('worker_profiles').select('full_name').eq('user_id', dbUser.role === 'WORKER' ? dbUser.id : targetUserId).maybeSingle()
  const { data: employer } = await supabase.from('employer_profiles').select('company_name').eq('user_id', dbUser.role === 'EMPLOYER' ? dbUser.id : targetUserId).maybeSingle()

  const roomName = `${employer?.company_name || 'Angajator'} & ${worker?.full_name || 'Lucrător'}`

  const { data: newRoom, error: roomError } = await supabase
    .from('chat_rooms')
    .insert({
      type: 'DIRECT',
      name: roomName
    })
    .select('id')
    .single()

  if (roomError || !newRoom) {
    return { error: roomError?.message || 'Eroare la crearea camerei' }
  }

  // Add members
  const { error: membersError } = await supabase
    .from('chat_room_members')
    .insert([
      { room_id: newRoom.id, user_id: dbUser.id },
      { room_id: newRoom.id, user_id: targetUserId }
    ])

  if (membersError) {
    return { error: membersError.message }
  }

  revalidatePath('/chat')
  return { roomId: newRoom.id }
}

export async function getPotentialConnections() {
  const supabase = await createClient()
  const dbUser = await getDbUser()
  if (!dbUser) return []

  if (dbUser.role === 'WORKER') {
    // Get all employers
    const { data, error } = await supabase
      .from('employer_profiles')
      .select('user_id, company_name, city')
    if (error) {
      console.error('getPotentialConnections employer error:', error)
      return []
    }
    return data.map(e => ({
      user_id: e.user_id,
      name: e.company_name,
      city: e.city,
      role: 'EMPLOYER' as const,
      avatar_url: null
    }))
  } else {
    // Get all workers with avatars
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('user_id, full_name, city, users(avatar_url)')
    if (error) {
      console.error('getPotentialConnections worker error:', error)
      return []
    }
    return data.map(w => ({
      user_id: w.user_id,
      name: w.full_name,
      city: w.city,
      role: 'WORKER' as const,
      avatar_url: (w.users as any)?.avatar_url || null
    }))
  }
}

