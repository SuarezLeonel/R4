import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyPassword, generateToken } from '../utils/security.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'username y password son requeridos' });
    }

    const usuarios = await query(
      `SELECT id, username, email, password_hash FROM usuarios WHERE username = ? LIMIT 1`,
      [username]
    );

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = usuarios[0];
    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken({ id: user.id, username: user.username });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
