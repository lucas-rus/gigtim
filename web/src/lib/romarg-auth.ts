'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { dbPool } from '@/lib/romarg-db';
import { sendVerificationEmail } from '@/lib/email';

export interface UserProfile {
  id: string;
  email: string;
  role: 'WORKER' | 'EMPLOYER' | 'ADMIN';
  email_verified: boolean;
  full_name?: string;
  phone_number?: string;
  company_name?: string;
  cui?: string;
  address?: string;
  city?: string;
  county?: string;
  cnp?: string;
  id_card_series?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Outside request context
  }

  try {
    if (!cookieStore) return null;
    let sessionVal = cookieStore.get('gigtim_session')?.value;
    if (!sessionVal) return null;

    // Decode if URL-encoded
    if (sessionVal.includes('%')) {
      try {
        sessionVal = decodeURIComponent(sessionVal);
      } catch {
        // ignore
      }
    }

    let parsed: { userId: string; email: string; role: string };
    try {
      parsed = JSON.parse(sessionVal);
    } catch (err) {
      console.error('getCurrentProfile JSON parse error:', err, 'Raw cookie:', sessionVal);
      try {
        cookieStore.delete('gigtim_session');
      } catch {}
      return null;
    }

    if (!parsed?.userId) {
      try {
        cookieStore.delete('gigtim_session');
      } catch {}
      return null;
    }

    const connection = await dbPool.getConnection();
    try {
      const [userRows] = await connection.query<any[]>(
        'SELECT id, email, role, email_verified, avatar_url, created_at FROM users WHERE id = ?',
        [parsed.userId]
      );

      if (userRows.length === 0) {
        console.warn('User ID not found in database, clearing session cookie:', parsed.userId);
        try {
          cookieStore.delete('gigtim_session');
        } catch {}
        return null;
      }

      const user = userRows[0];
      let profileData: any = {};

      if (user.role === 'WORKER') {
        const [wRows] = await connection.query<any[]>(
          'SELECT full_name, phone_number, city, county, cnp, id_card_series, bio FROM worker_profiles WHERE user_id = ?',
          [user.id]
        );
        if (wRows.length > 0) profileData = wRows[0];
      } else {
        const [eRows] = await connection.query<any[]>(
          'SELECT company_name, cui, address, city, county FROM employer_profiles WHERE user_id = ?',
          [user.id]
        );
        if (eRows.length > 0) profileData = eRows[0];
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        email_verified: Boolean(user.email_verified),
        created_at: user.created_at ? new Date(user.created_at).toISOString() : undefined,
        ...profileData,
      };
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('getCurrentProfile database error:', err);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('gigtim_session');
  } catch {
    // Outside request context
  }
}

export async function romargRegister(formData: FormData) {
  try {
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const password = (formData.get('password') as string || '');
    const role = (formData.get('role') as string) || 'WORKER';
    const fullName = (formData.get('fullName') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const city = (formData.get('city') as string || '').trim();
    const county = (formData.get('county') as string || '').trim();
    const companyName = (formData.get('companyName') as string || '').trim();
    const cui = (formData.get('cui') as string || '').trim();
    const address = (formData.get('address') as string || '').trim();

    if (!email || !password) return { error: 'Emailul și parola sunt obligatorii.' };
    if (password.length < 6) return { error: 'Parola trebuie să aibă minim 6 caractere.' };
    if (!phone || !city || !county) return { error: 'Telefonul, județul și localitatea sunt obligatorii.' };
    if (role === 'WORKER' && !fullName) return { error: 'Numele complet este obligatoriu.' };
    if (role === 'EMPLOYER') {
      if (!companyName) return { error: 'Numele companiei este obligatoriu.' };
      if (!cui || !/^(RO)?\d{2,10}$/i.test(cui)) return { error: 'CUI-ul este invalid.' };
    }

    const connection = await dbPool.getConnection();
    try {
      const [existing] = await connection.query<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existing.length > 0) return { error: 'Un cont cu această adresă de email există deja.' };

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();
      const verificationToken = crypto.randomBytes(32).toString('hex');

      await connection.beginTransaction();

      await connection.query(
        'INSERT INTO users (id, email, password_hash, role, email_verified, verification_token) VALUES (?, ?, ?, ?, 0, ?)',
        [userId, email, passwordHash, role, verificationToken]
      );

      if (role === 'WORKER') {
        await connection.query(
          'INSERT INTO worker_profiles (user_id, full_name, phone_number, city, county) VALUES (?, ?, ?, ?, ?)',
          [userId, fullName, phone, city, county]
        );
      } else {
        await connection.query(
          'INSERT INTO employer_profiles (user_id, company_name, cui, address, city, county) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, companyName, cui, address, city, county]
        );
      }

      await connection.commit();

      await sendVerificationEmail(email, verificationToken);

      return { success: true, userId, role, verificationToken };
    } catch (err: any) {
      await connection.rollback();
      console.error('ROMARG DB Register Error:', err);
      return { error: err.message || 'Eroare la crearea contului pe server.' };
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('ROMARG Connection Error:', error);
    return { error: 'Eroare de conexiune la server. Te rugăm să încerci din nou.' };
  }
}

export async function verifyEmailToken(token: string) {
  if (!token) return { error: 'Token de verificare invalid sau lipsă.' };

  try {
    const connection = await dbPool.getConnection();
    try {
      const [users] = await connection.query<any[]>(
        'SELECT id, email, role FROM users WHERE verification_token = ?',
        [token]
      );

      if (users.length === 0) {
        return { error: 'Token-ul de verificare este invalid sau a fost deja utilizat.' };
      }

      const user = users[0];

      await connection.query(
        'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
        [user.id]
      );

      try {
        const cookieStore = await cookies();
        cookieStore.set('gigtim_session', JSON.stringify({ userId: user.id, email: user.email, role: user.role }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      } catch {
        // Outside HTTP request scope
      }

      return { success: true, email: user.email };
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return { error: 'Eroare la verificarea email-ului: ' + err.message };
  }
}

export async function romargLogin(formData: FormData) {
  try {
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const password = (formData.get('password') as string || '');

    if (!email || !password) return { error: 'Emailul și parola sunt obligatorii.' };

    const connection = await dbPool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        'SELECT id, email, password_hash, role, email_verified FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) return { error: 'Email sau parolă incorectă.' };

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return { error: 'Email sau parolă incorectă.' };

      if (!user.email_verified) {
        return { error: 'Adresa ta de email nu a fost încă verificată. Te rugăm să apeși pe link-ul primit în inbox.' };
      }

      try {
        const cookieStore = await cookies();
        cookieStore.set('gigtim_session', JSON.stringify({ userId: user.id, email: user.email, role: user.role }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      } catch (err: any) {
        console.warn('Cookie set notice:', err.message);
      }

      return { success: true, user: { id: user.id, role: user.role } };
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return { error: 'Eroare la autentificare pe server: ' + error.message };
  }
}
