import mysql from 'mysql2/promise';

// Run from web/: node --env-file=.env.local scripts/test-romarg-db.mjs (reads the ROMARG_DB_* variables).

async function testDatabase() {
  console.log(`Connecting to ROMARG MySQL server (${process.env.ROMARG_DB_HOST})...`);
  const connection = await mysql.createConnection({
    host: process.env.ROMARG_DB_HOST,
    port: Number(process.env.ROMARG_DB_PORT) || 3306,
    user: process.env.ROMARG_DB_USER,
    password: process.env.ROMARG_DB_PASSWORD,
    database: process.env.ROMARG_DB_NAME,
  });

  console.log('Connected successfully!');
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Database tables count:', tables.length);

  const testId = 'test-id-' + Date.now();
  const testEmail = 'test-' + Date.now() + '@gigtim.ro';
  console.log('Testing INSERT user:', testEmail);

  await connection.query(
    'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [testId, testEmail, '$2a$10$abcdefghijklmnopqrstuu', 'WORKER']
  );

  const [users] = await connection.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [testId]);
  console.log('Inserted User Record Verified:', users[0]);

  await connection.query('DELETE FROM users WHERE id = ?', [testId]);
  console.log('Test user cleaned up.');

  await connection.end();
  console.log('Database verification finished successfully!');
}

testDatabase().catch((err) => {
  console.error('Database Verification Failed:', err);
  process.exit(1);
});
