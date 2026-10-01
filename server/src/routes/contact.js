import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

const EMAIL_REGEX = /\S+@\S+\.\S+/;

router.post('/contact', async (req, res, next) => {
  try {
    const body = req.body || {};
    const { nombre, email, mensaje } = body;
    const errors = [];

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      errors.push('El campo nombre es requerido y no puede estar vacío');
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push('El campo email es requerido y no puede estar vacío');
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push('El email no tiene un formato válido');
    }

    if (!mensaje || typeof mensaje !== 'string') {
      errors.push('El campo mensaje es requerido');
    } else if (mensaje.trim().length < 10) {
      errors.push('El mensaje debe tener al menos 10 caracteres');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    const result = await query(
      `INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)`,
      [nombre.trim(), email.trim(), mensaje.trim()]
    );

    return res.status(201).json({
      ok: true,
      id: result ? result.lastInsertRowid : null,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
