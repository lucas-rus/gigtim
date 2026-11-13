import mysql from 'mysql2/promise';

// Connection settings come only from the environment: web/.env.local on your machine, the Vercel project's
// Environment Variables in production. Never put them in code; this repo is public.
const missing = ['ROMARG_DB_HOST', 'ROMARG_DB_USER', 'ROMARG_DB_PASSWORD', 'ROMARG_DB_NAME'].filter((k) => !process.env[k]);
if (missing.length) console.error(`romarg-db: ${missing.join(', ')} not set; database calls will fail until they are.`);

export const dbPool = mysql.createPool({
  host: process.env.ROMARG_DB_HOST,
  port: Number(process.env.ROMARG_DB_PORT) || 3306,
  user: process.env.ROMARG_DB_USER,
  password: process.env.ROMARG_DB_PASSWORD,
  database: process.env.ROMARG_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});
