import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '..', '.env') });

function getDriver() {
  return (process.env.DB_DRIVER || 'sqlite').toLowerCase();
}

let dbInstance = null;
let mysqlPoolInstance = null;

function convertPlaceholdersToPg(sql) {
  let idx = 0;
  return sql.replace(/\?/g, () => {
    idx += 1;
    return `$${idx}`;
  });
}

function isSelectQuery(sql) {
  const trimmed = sql.trim().toLowerCase();
  return trimmed.startsWith('select') || trimmed.startsWith('with') || trimmed.startsWith('show') || trimmed.startsWith('describe');
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

async function getMysqlPool() {
  if (mysqlPoolInstance) return mysqlPoolInstance;
  const mysql = await import('mysql2/promise');
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error('DATABASE_URL no definido para MySQL/MariaDB');

  const poolOptions = {
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };

  // Soporte para SSL si es requerido por hostings como PlanetScale, Aiven, TiDB, Clever Cloud, etc.
  if (process.env.DB_SSL === 'true' || DATABASE_URL.includes('ssl=') || DATABASE_URL.includes('sslmode=')) {
    poolOptions.ssl = { rejectUnauthorized: false };
  }

  mysqlPoolInstance = mysql.createPool(poolOptions);
  return mysqlPoolInstance;
}

export async function getDb() {
  const driver = getDriver();
  if (driver === 'sqlite') return getSqliteDb();
  if (driver === 'pg') return getPgPool();
  if (driver === 'mysql' || driver === 'mariadb') return getMysqlPool();
  throw new Error(`DB_DRIVER no soportado: ${driver}`);
}

export async function query(sql, params = []) {
  const normalizedParams = Array.isArray(params) ? params : [params];
  const isSelect = isSelectQuery(sql);
  const driver = getDriver();

  if (driver === 'sqlite') {
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

  if (driver === 'mysql' || driver === 'mariadb') {
    const pool = await getMysqlPool();
    const [result] = await pool.execute(sql, normalizedParams);
    if (isSelect) {
      return result || [];
    }
    return {
      changes: result ? result.affectedRows : 0,
      lastInsertRowid: result ? result.insertId : null,
    };
  }

  if (driver === 'pg') {
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

  throw new Error(`DB_DRIVER no soportado: ${driver}`);
}

export default { query, getDb };
