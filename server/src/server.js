import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from '../database/init.js';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const PORT = parseInt(process.env.PORT || '3001', 10);
const DB_DRIVER = process.env.DB_DRIVER || 'sqlite';

async function start() {
  try {
    if (DB_DRIVER === 'sqlite') {
      await initDatabase();
    }

    app.listen(PORT, () => {
      console.log(`[SERVER] Portfolio API escuchando en http://localhost:${PORT}`);
      console.log(`[SERVER] DB_DRIVER=${DB_DRIVER}`);
      console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[SERVER] Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
