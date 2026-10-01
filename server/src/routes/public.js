import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/persona', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, nombre, apellido, titulo_profesional, sobre_mi, email_contacto, github_url, linkedin_url, avatar_url
       FROM persona LIMIT 1`
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/categorias', async (req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM categorias_habilidades ORDER BY id ASC`);
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

router.get('/habilidades', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT h.id, h.categoria_id, h.nombre, h.nivel_porcentaje, h.icono_url,
              c.nombre_categoria
       FROM habilidades h
       INNER JOIN categorias_habilidades c ON c.id = h.categoria_id
       ORDER BY c.id ASC, h.nivel_porcentaje DESC`
    );
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

router.get('/experiencias', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM experiencias ORDER BY fecha_inicio DESC`
    );
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

router.get('/logros', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM logros ORDER BY fecha_obtencion DESC`
    );
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

async function fetchProyectosWithHabilidades(proyectoId) {
  let proyectosSql = `SELECT * FROM proyectos`;
  const params = [];
  if (proyectoId) {
    proyectosSql += ` WHERE id = ?`;
    params.push(proyectoId);
  }
  proyectosSql += ` ORDER BY destacado DESC, fecha_creacion DESC`;

  const proyectos = await query(proyectosSql, params);
  if (!proyectos || proyectos.length === 0) return [];

  const ids = proyectos.map((p) => p.id);
  const placeholders = ids.map(() => '?').join(',');
  const links = await query(
    `SELECT ph.proyecto_id, ph.habilidad_id, h.nombre, h.nivel_porcentaje, h.icono_url, h.categoria_id
     FROM proyecto_habilidades ph
     INNER JOIN habilidades h ON h.id = ph.habilidad_id
     WHERE ph.proyecto_id IN (${placeholders})`,
    ids
  );

  const habilidadesByProyecto = new Map();
  for (const link of links || []) {
    if (!habilidadesByProyecto.has(link.proyecto_id)) {
      habilidadesByProyecto.set(link.proyecto_id, []);
    }
    habilidadesByProyecto.get(link.proyecto_id).push({
      id: link.habilidad_id,
      nombre: link.nombre,
      nivel_porcentaje: link.nivel_porcentaje,
      icono_url: link.icono_url,
      categoria_id: link.categoria_id,
    });
  }

  return proyectos.map((p) => ({
    ...p,
    habilidades: habilidadesByProyecto.get(p.id) || [],
  }));
}

router.get('/proyectos', async (req, res, next) => {
  try {
    const proyectos = await fetchProyectosWithHabilidades();
    return res.status(200).json(proyectos || []);
  } catch (err) {
    return next(err);
  }
});

router.get('/proyectos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const proyectos = await fetchProyectosWithHabilidades(id);
    if (!proyectos || proyectos.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    return res.status(200).json(proyectos[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;
