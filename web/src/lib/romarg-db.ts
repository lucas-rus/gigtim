import mysql from 'mysql2/promise';

export const dbPool = mysql.createPool({
  host: process.env.ROMARG_DB_HOST || 'REMOVED',
  port: Number(process.env.ROMARG_DB_PORT) || 3306,
  user: process.env.ROMARG_DB_USER || 'REMOVED',
  password: process.env.ROMARG_DB_PASSWORD || 'REMOVED',
  database: process.env.ROMARG_DB_NAME || 'REMOVED',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});
