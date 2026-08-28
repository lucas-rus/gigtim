import { dbPool } from '../src/lib/romarg-db.ts';

async function listUsers() {
  const connection = await dbPool.getConnection();
  try {
    const [rows] = await connection.query('SELECT id, email, role, email_verified, created_at FROM users');
    console.log('--- ALL USERS IN DB ---');
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    connection.release();
  }
}

listUsers();
