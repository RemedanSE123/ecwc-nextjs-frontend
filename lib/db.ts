import { Pool } from 'pg';

/**
 * Get database connection config.
 * Supports both:
 * - DATABASE_URL (full connection string for local or Neon)
 * - Individual vars: DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME
 */
function getDbConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    };
  }
  return {
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? '',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'ecwc_db',
  };
}

const pool = new Pool(getDbConfig());

/** Run a query and return rows (compatible with Neon-style usage) */
export async function query<T = unknown>(text: string, params?: (string | number)[]): Promise<T[]> {
  try {
    const result = await pool.query(text, params);
    return (result.rows ?? []) as T[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
    throw new Error(`DB query failed: ${msg}${code ? ` (code: ${code})` : ''}`);
  }
}

/** Raw pool for advanced usage */
export { pool, getDbConfig };
