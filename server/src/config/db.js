import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const DB_DRIVER = process.env.DB_DRIVER || 'sqlite';

let dbInstance = null;

function convertPlaceholdersToPg(sql) {
  let idx = 0;
  return sql.replace(/\?/g, () => {
    idx += 1;
    return `$${idx}`;
  });
}

function isSelectQuery(sql) {
  const trimmed = sql.trim().toLowerCase();
  return trimmed.startsWith('select') || trimmed.startsWith('with');
}

async function getSqliteDb() {
  if (dbInstance) return dbInstance;
  const Database = (await import('better-sqlite3')).default;
  const DATABASE_URL = process.env.DATABASE_URL || 'file:./database/app.db';
  const projectRoot = join(__dirname, '..', '..');
  let filePath;
  if (DATABASE_URL.startsWith('file:')) {
    const raw = DATABASE_URL.slice(5);
    if (raw.startsWith('/') || /^[A-Za-z]:[\\/]/.test(raw)) {
      filePath = raw;
    } else {
      filePath = join(projectRoot, raw);
    }
  } else {
    filePath = DATABASE_URL;
  }

  const fs = await import('fs');
  const dbDir = dirname(filePath);
  if (dbDir && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(filePath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  return dbInstance;
}

async function getPgPool() {
  if (dbInstance) return dbInstance;
  const pg = await import('pg');
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error('DATABASE_URL no definido para PostgreSQL');
  dbInstance = new pg.Pool({ connectionString: DATABASE_URL });
  return dbInstance;
}

export async function getDb() {
  if (DB_DRIVER === 'sqlite') return getSqliteDb();
  if (DB_DRIVER === 'pg') return getPgPool();
  throw new Error(`DB_DRIVER no soportado: ${DB_DRIVER}`);
}

export async function query(sql, params = []) {
  const normalizedParams = Array.isArray(params) ? params : [params];
  const isSelect = isSelectQuery(sql);

  if (DB_DRIVER === 'sqlite') {
    const db = await getSqliteDb();
    const stmt = db.prepare(sql);
    if (isSelect) {
      const rows = stmt.all(...normalizedParams);
      return rows;
    }
    const result = stmt.run(...normalizedParams);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  if (DB_DRIVER === 'pg') {
    const pool = await getPgPool();
    let pgSql = convertPlaceholdersToPg(sql);
    
    const upperSql = pgSql.trim().toUpperCase();
    if (upperSql.startsWith('INSERT') && !upperSql.includes('RETURNING') && !upperSql.includes('PROYECTO_HABILIDADES')) {
      pgSql += ' RETURNING id';
    }

    const result = await pool.query(pgSql, normalizedParams);
    if (isSelect) {
      return result.rows || [];
    }
    return {
      changes: result.rowCount || 0,
      lastInsertRowid:
        result.rows && result.rows.length && result.rows[0] && result.rows[0].id
          ? result.rows[0].id
          : null,
    };
  }

  throw new Error(`DB_DRIVER no soportado: ${DB_DRIVER}`);
}

export default { query, getDb };
