import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const DB_DRIVER = process.env.DB_DRIVER || 'sqlite';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

function buildSqlForPg(sqliteSql) {
  let sql = sqliteSql;
  sql = sql.replace(/\bINTEGER PRIMARY KEY AUTOINCREMENT\b/gi, 'SERIAL PRIMARY KEY');
  sql = sql.replace(/\bINTEGER PRIMARY KEY\b/gi, 'SERIAL PRIMARY KEY');
  sql = sql.replace(/AUTOINCREMENT/gi, 'GENERATED ALWAYS AS IDENTITY');
  sql = sql.replace(/datetime\('now'\)/gi, 'NOW()');
  sql = sql.replace(/\bINSERT OR IGNORE INTO\b/gi, 'INSERT INTO');
  return sql;
}

async function initDatabase() {
  const schemaPath = join(__dirname, 'schema.sql');
  let rawSchema = readFileSync(schemaPath, 'utf-8');

  const passwordHash = bcrypt.hashSync('Admin1234!', BCRYPT_ROUNDS);
  rawSchema = rawSchema.replace(/__PASSWORD_HASH_PLACEHOLDER__/g, passwordHash);

  if (DB_DRIVER === 'sqlite') {
    const Database = (await import('better-sqlite3')).default;
    const DATABASE_URL = process.env.DATABASE_URL || 'file:./database/app.db';
    const projectRoot = join(__dirname, '..');
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

    const dbDir = dirname(filePath);
    if (dbDir) {
      const fs = await import('fs');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }

    const db = new Database(filePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(rawSchema);
    console.log('[DB] SQLite inicializada correctamente en:', filePath);
    return db;
  }

  if (DB_DRIVER === 'pg') {
    const pg = await import('pg');
    const Pool = pg.Pool;
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL no definido para PostgreSQL');
    }

    const pool = new Pool({ connectionString: DATABASE_URL });
    const pgSchema = buildSqlForPg(rawSchema);

    const statements = pgSchema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err) {
        console.warn('[DB][PG] Warning ejecutando statement:', err.message);
      }
    }

    console.log('[DB] PostgreSQL inicializada correctamente');
    return pool;
  }

  throw new Error(`DB_DRIVER no soportado: ${DB_DRIVER}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase()
    .then(() => {
      console.log('[DB] Inicialización completada.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[DB] Error de inicialización:', err);
      process.exit(1);
    });
}

export { initDatabase };
export default initDatabase;
