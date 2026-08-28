'use server';

import crypto from 'crypto';
import { dbPool } from '@/lib/romarg-db';
import { getCurrentProfile } from '@/lib/romarg-auth';

function serializeRow(row: any) {
  if (!row) return row;
  const copy = { ...row };
  for (const key of Object.keys(copy)) {
    if (copy[key] instanceof Date) {
      copy[key] = copy[key].toISOString();
    }
  }
  return copy;
}

function serializeRows(rows: any[]) {
  return (rows || []).map(serializeRow);
}

// --- SHIFTS & JOBS ---

export async function getOpenShifts(county?: string, city?: string, category?: string) {
  try {
    const connection = await dbPool.getConnection();
    try {
      let query = `
        SELECT s.*, e.company_name, e.city as employer_city, e.county as employer_county,
               e.lat as employer_lat, e.lng as employer_lng, e.employer_rating,
               eu.avatar_url as employer_avatar
        FROM job_shifts s
        JOIN employer_profiles e ON s.employer_id = e.user_id
        LEFT JOIN users eu ON eu.id = e.user_id
        WHERE s.status = 'OPEN'
      `;
      const params: any[] = [];

      if (county) {
        query += ' AND (s.county = ? OR e.county = ?)';
        params.push(county, county);
      }
      if (city) {
        query += ' AND (s.city = ? OR e.city = ?)';
        params.push(city, city);
      }
      if (category) {
        query += ' AND s.category = ?';
        params.push(category);
      }

      query += ' ORDER BY s.created_at DESC';

      const [rows] = await connection.query<any[]>(query, params);
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('getOpenShifts error:', err);
    return [];
  }
}

export async function getMyShifts() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  try {
    const connection = await dbPool.getConnection();
    try {
      if (profile.role === 'WORKER') {
        // Shifts the worker applied to, with their application status
        const [rows] = await connection.query<any[]>(
          `SELECT s.*, a.id as application_id, a.status as my_application_status,
                  e.company_name, e.city as employer_city, e.county as employer_county
           FROM applications a
           JOIN job_shifts s ON a.shift_id = s.id
           JOIN employer_profiles e ON s.employer_id = e.user_id
           WHERE a.worker_id = ?
           ORDER BY s.start_time DESC`,
          [profile.id]
        );
        return serializeRows(rows);
      }

      const [rows] = await connection.query<any[]>(
        `SELECT s.*,
                (SELECT COUNT(*) FROM applications a WHERE a.shift_id = s.id) as application_count
         FROM job_shifts s WHERE s.employer_id = ? ORDER BY s.created_at DESC`,
        [profile.id]
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getMyShifts error:', err);
    return [];
  }
}

export async function createShift(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'EMPLOYER') {
    return { error: 'Doar angajatorii pot crea joburi.' };
  }

  const roleNeeded = (formData.get('role_needed') as string || '').trim();
  const hourlyPayRon = Number(formData.get('hourly_pay_ron')) || 0;
  const startTimeStr = formData.get('start_time') as string;
  const endTimeStr = formData.get('end_time') as string;

  const VALID_ROLES = ['BARISTA', 'WAITER', 'DISHWASHER', 'STAGEHAND'];
  if (!VALID_ROLES.includes(roleNeeded)) {
    return { error: 'Rolul selectat este invalid.' };
  }
  if (hourlyPayRon <= 0 || !startTimeStr || !endTimeStr) {
    return { error: 'Toate câmpurile sunt obligatorii, iar plata pe oră trebuie să fie pozitivă.' };
  }

  const startDate = new Date(startTimeStr);
  const endDate = new Date(endTimeStr);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: 'Datele de început și sfârșit trebuie să fie valide.' };
  }
  if (endDate <= startDate) {
    return { error: 'Ora de sfârșit trebuie să fie după ora de început.' };
  }

  const shiftId = crypto.randomUUID();

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query(
        `INSERT INTO job_shifts
          (id, employer_id, role_needed, start_time, end_time, hourly_pay_ron, status)
         VALUES (?, ?, ?, ?, ?, ?, 'OPEN')`,
        [shiftId, profile.id, roleNeeded, startDate, endDate, hourlyPayRon]
      );
      return { success: true, shiftId };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('createShift error:', err);
    return { error: 'Eroare la salvarea turei: ' + err.message };
  }
}

// --- APPLICATIONS ---

export async function applyToShift(shiftId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'WORKER') {
    return { error: 'Doar lucrătorii pot aplica la joburi.' };
  }

  try {
    const connection = await dbPool.getConnection();
    try {
      // Identity gate (Legea 52/2011): CNP + Serie CI required before applying
      const [wRows] = await connection.query<any[]>(
        'SELECT cnp, id_card_series FROM worker_profiles WHERE user_id = ?',
        [profile.id]
      );
      const wp = wRows[0];
      if (!wp?.cnp || !wp?.id_card_series) {
        return { error: 'Verifică-ți identitatea în profil (CNP + Serie CI) pentru a aplica la ture.' };
      }

      // Shift must still be OPEN
      const [sRows] = await connection.query<any[]>(
        'SELECT status FROM job_shifts WHERE id = ?',
        [shiftId]
      );
      if (sRows.length === 0) {
        return { error: 'Această tură nu mai există.' };
      }
      if (sRows[0].status !== 'OPEN') {
        return { error: 'Această tură nu mai este disponibilă.' };
      }

      const [existing] = await connection.query<any[]>(
        'SELECT id FROM applications WHERE shift_id = ? AND worker_id = ?',
        [shiftId, profile.id]
      );
      if (existing.length > 0) {
        return { error: 'Ai aplicat deja la acest job.' };
      }

      const appId = crypto.randomUUID();
      await connection.query(
        'INSERT INTO applications (id, shift_id, worker_id, status) VALUES (?, ?, ?, "PENDING")',
        [appId, shiftId, profile.id]
      );
      return { success: true, appId };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('applyToShift error:', err);
    return { error: 'Eroare la aplicare: ' + err.message };
  }
}

/** Returns the set of shift IDs the current worker has already applied to. */
export async function getMyAppliedShiftIds(): Promise<string[]> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'WORKER') return [];

  try {
    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        'SELECT shift_id FROM applications WHERE worker_id = ?',
        [profile.id]
      );
      return rows.map((r: any) => r.shift_id);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getMyAppliedShiftIds error:', err);
    return [];
  }
}

export async function getMyApplications() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  try {
    const connection = await dbPool.getConnection();
    try {
      if (profile.role === 'WORKER') {
        const [rows] = await connection.query<any[]>(
          `SELECT a.*, s.role_needed as shift_role, s.hourly_pay_ron, s.start_time, s.end_time, e.company_name
           FROM applications a
           JOIN job_shifts s ON a.shift_id = s.id
           JOIN employer_profiles e ON s.employer_id = e.user_id
           WHERE a.worker_id = ?
           ORDER BY a.created_at DESC`,
          [profile.id]
        );
        return serializeRows(rows);
      } else {
        const [rows] = await connection.query<any[]>(
          `SELECT a.*, s.role_needed as shift_role, w.full_name as worker_name, w.phone_number as worker_phone,
                  wu.avatar_url as worker_avatar, w.cnp as worker_cnp, w.id_card_series as worker_id_card_series,
                  w.city as worker_city, w.county as worker_county, w.reliability_score
           FROM applications a
           JOIN job_shifts s ON a.shift_id = s.id
           JOIN worker_profiles w ON a.worker_id = w.user_id
           LEFT JOIN users wu ON wu.id = w.user_id
           WHERE s.employer_id = ?
           ORDER BY a.created_at DESC`,
          [profile.id]
        );
        return serializeRows(rows);
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getMyApplications error:', err);
    return [];
  }
}

export async function updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'EMPLOYER') {
    return { error: 'Neautorizat.' };
  }

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query(
        'UPDATE applications SET status = ? WHERE id = ?',
        [status, applicationId]
      );
      return { success: true };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: 'Eroare la actualizarea aplicării: ' + err.message };
  }
}

// --- FORUM ---

export async function getForumPosts() {
  try {
    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        `SELECT fp.*, u.email as author_email, 
                COALESCE(w.full_name, e.company_name, u.email) as author_name,
                u.avatar_url as author_avatar
         FROM forum_posts fp
         JOIN users u ON fp.author_id = u.id
         LEFT JOIN worker_profiles w ON u.id = w.user_id
         LEFT JOIN employer_profiles e ON u.id = e.user_id
         ORDER BY fp.created_at DESC`
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getForumPosts error:', err);
    return [];
  }
}

export async function createForumPost(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Trebuie să fii autentificat pentru a posta.' };

  const title = (formData.get('title') as string || '').trim();
  const content = (formData.get('content') as string || '').trim();
  const category = (formData.get('category') as string || 'GENERAL').trim();

  if (!title || !content) {
    return { error: 'Titlul și conținutul sunt obligatorii.' };
  }

  const postId = crypto.randomUUID();

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query(
        'INSERT INTO forum_posts (id, author_id, title, content, category) VALUES (?, ?, ?, ?, ?)',
        [postId, profile.id, title, content, category]
      );
      return { success: true, postId };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: 'Eroare la publicare: ' + err.message };
  }
}

export async function getForumComments(postId: string) {
  try {
    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        `SELECT fc.*, u.email as author_email,
                COALESCE(w.full_name, e.company_name, u.email) as author_name,
                u.avatar_url as author_avatar
         FROM forum_comments fc
         JOIN users u ON fc.author_id = u.id
         LEFT JOIN worker_profiles w ON u.id = w.user_id
         LEFT JOIN employer_profiles e ON u.id = e.user_id
         WHERE fc.post_id = ?
         ORDER BY fc.created_at ASC`,
        [postId]
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getForumComments error:', err);
    return [];
  }
}

export async function createForumComment(postId: string, content: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Trebuie să fii autentificat pentru a comenta.' };

  if (!content.trim()) return { error: 'Comentariul nu poate fi gol.' };

  const commentId = crypto.randomUUID();

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query(
        'INSERT INTO forum_comments (id, post_id, author_id, content) VALUES (?, ?, ?, ?)',
        [commentId, postId, profile.id, content.trim()]
      );
      return { success: true, commentId };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: 'Eroare la adăugarea comentariului: ' + err.message };
  }
}

// --- PROFILE UPDATES ---

export async function updateWorkerProfile(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'WORKER') return { error: 'Neautorizat.' };

  const fullName = (formData.get('full_name') as string || '').trim();
  const phone = (formData.get('phone_number') as string || '').trim();
  const city = (formData.get('city') as string || '').trim();
  const county = (formData.get('county') as string || '').trim();
  const bio = (formData.get('bio') as string || '').trim();
  const cnp = (formData.get('cnp') as string || '').trim();
  const idCardSeries = (formData.get('id_card_series') as string || '').trim();

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query(
        `UPDATE worker_profiles 
         SET full_name = ?, phone_number = ?, city = ?, county = ?, bio = ?, cnp = NULLIF(?, ''), id_card_series = NULLIF(?, '')
         WHERE user_id = ?`,
        [fullName, phone, city, county, bio, cnp, idCardSeries, profile.id]
      );
      return { success: true };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: 'Eroare la salvarea profilului: ' + err.message };
  }
}

export async function updateEmployerProfile(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'EMPLOYER') return { error: 'Neautorizat.' };

  const companyName = (formData.get('company_name') as string || '').trim();
  const cui = (formData.get('cui') as string || '').trim();
  const address = (formData.get('address') as string || '').trim();
  const city = (formData.get('city') as string || '').trim();
  const county = (formData.get('county') as string || '').trim();
  const bio = (formData.get('bio') as string || '').trim();

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query(
        `UPDATE employer_profiles 
         SET company_name = ?, cui = ?, address = ?, city = ?, county = ?, bio = ?
         WHERE user_id = ?`,
        [companyName, cui, address, city, county, bio, profile.id]
      );
      return { success: true };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: 'Eroare la salvarea profilului: ' + err.message };
  }
}

export async function getUserReviews(userId: string) {
  try {
    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        `SELECT r.*, u.email as reviewer_email,
                COALESCE(w.full_name, e.company_name) as reviewer_name
         FROM reviews r
         JOIN users u ON r.reviewer_id = u.id
         LEFT JOIN worker_profiles w ON u.id = w.user_id
         LEFT JOIN employer_profiles e ON u.id = e.user_id
         WHERE r.reviewee_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getUserReviews error:', err);
    return [];
  }
}

// --- CHAT FUNCTIONS ---

export async function getOrCreateDirectChat(otherUserId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Neautorizat' };

  try {
    const connection = await dbPool.getConnection();
    try {
      const [existing] = await connection.query<any[]>(
        `SELECT m1.room_id 
         FROM chat_room_members m1
         JOIN chat_room_members m2 ON m1.room_id = m2.room_id
         WHERE m1.user_id = ? AND m2.user_id = ?`,
        [profile.id, otherUserId]
      );

      if (existing.length > 0) {
        return { roomId: existing[0].room_id };
      }

      const roomId = crypto.randomUUID();
      await connection.beginTransaction();

      await connection.query('INSERT INTO chat_rooms (id) VALUES (?)', [roomId]);
      await connection.query('INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?), (?, ?)', [
        roomId, profile.id, roomId, otherUserId
      ]);

      await connection.commit();
      return { roomId };
    } catch (err: any) {
      await connection.rollback();
      return { error: err.message };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getChatRooms() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  try {
    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        `SELECT cr.id as room_id, cr.created_at,
                u.id as other_user_id, u.email as other_email,
                COALESCE(w.full_name, e.company_name, u.email) as other_name,
                u.avatar_url as other_avatar,
                (SELECT cm.content FROM chat_messages cm WHERE cm.room_id = cr.id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
                (SELECT cm.created_at FROM chat_messages cm WHERE cm.room_id = cr.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_at,
                (SELECT cm.sender_id FROM chat_messages cm WHERE cm.room_id = cr.id ORDER BY cm.created_at DESC LIMIT 1) as last_sender_id
         FROM chat_room_members crm
         JOIN chat_rooms cr ON crm.room_id = cr.id
         JOIN chat_room_members crm_other ON cr.id = crm_other.room_id AND crm_other.user_id != crm.user_id
         JOIN users u ON crm_other.user_id = u.id
         LEFT JOIN worker_profiles w ON u.id = w.user_id
         LEFT JOIN employer_profiles e ON u.id = e.user_id
         WHERE crm.user_id = ?
         ORDER BY last_message_at DESC, cr.created_at DESC`,
        [profile.id]
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getChatRooms error:', err);
    return [];
  }
}

export async function getChatMessages(roomId: string) {
  try {
    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        `SELECT cm.*, u.email as sender_email,
                COALESCE(w.full_name, e.company_name, u.email) as sender_name
         FROM chat_messages cm
         JOIN users u ON cm.sender_id = u.id
         LEFT JOIN worker_profiles w ON u.id = w.user_id
         LEFT JOIN employer_profiles e ON u.id = e.user_id
         WHERE cm.room_id = ?
         ORDER BY cm.created_at ASC`,
        [roomId]
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getChatMessages error:', err);
    return [];
  }
}

export async function sendChatMessage(roomId: string, content: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Neautorizat' };

  if (!content.trim()) return { error: 'Mesajul nu poate fi gol.' };

  const messageId = crypto.randomUUID();

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query(
        'INSERT INTO chat_messages (id, room_id, sender_id, content) VALUES (?, ?, ?, ?)',
        [messageId, roomId, profile.id, content.trim()]
      );
      return { success: true, messageId };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: 'Eroare la trimiterea mesajului: ' + err.message };
  }
}

export async function getPotentialConnections() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  try {
    const connection = await dbPool.getConnection();
    try {
      const targetRole = profile.role === 'WORKER' ? 'EMPLOYER' : 'WORKER';
      const [rows] = await connection.query<any[]>(
        `SELECT u.id, u.email, u.role,
                COALESCE(w.full_name, e.company_name, u.email) as name,
                COALESCE(w.city, e.city) as city,
                u.avatar_url as avatar_url
         FROM users u
         LEFT JOIN worker_profiles w ON u.id = w.user_id
         LEFT JOIN employer_profiles e ON u.id = e.user_id
         WHERE u.role = ? AND u.id != ?
         LIMIT 20`,
        [targetRole, profile.id]
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getPotentialConnections error:', err);
    return [];
  }
}

export async function updateUserAvatar(avatarUrl: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Neautorizat' };

  try {
    const connection = await dbPool.getConnection();
    try {
      await connection.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, profile.id]);
      return { success: true };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('updateUserAvatar error:', err);
    return { error: 'Eroare la actualizarea pozei de profil: ' + err.message };
  }
}

export async function getAdminVerifications() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'ADMIN') return [];

  try {
    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        `SELECT v.*, w.full_name as worker_name, w.city as worker_city
         FROM id_verifications v
         LEFT JOIN worker_profiles w ON v.worker_id = w.user_id
         ORDER BY v.created_at DESC`
      );
      return serializeRows(rows);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getAdminVerifications error:', err);
    return [];
  }
}

export async function getAdminAuditLog() {
  return [];
}

