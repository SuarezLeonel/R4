import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();
router.use(authenticateJWT);

function pickFields(body, allowedFields) {
  const result = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      result[key] = body[key];
    }
  }
  return result;
}

function buildUpdateSql(table, fields, whereClause) {
  const columns = Object.keys(fields).map((k) => `${k} = ?`).join(', ');
  return `UPDATE ${table} SET ${columns} ${whereClause}`;
}

// -------------------- Persona --------------------
router.get('/persona', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, usuario_id, nombre, apellido, titulo_profesional, sobre_mi,
              email_contacto, github_url, linkedin_url, avatar_url
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

router.put('/persona/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = [
      'nombre',
      'apellido',
      'titulo_profesional',
      'sobre_mi',
      'email_contacto',
      'github_url',
      'linkedin_url',
      'avatar_url',
    ];
    const fields = pickFields(req.body || {}, allowed);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const existing = await query(`SELECT id FROM persona WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    const sql = buildUpdateSql('persona', fields, 'WHERE id = ?');
    const params = Object.values(fields);
    params.push(id);
    await query(sql, params);

    const updated = await query(
      `SELECT id, usuario_id, nombre, apellido, titulo_profesional, sobre_mi,
              email_contacto, github_url, linkedin_url, avatar_url
       FROM persona WHERE id = ? LIMIT 1`,
      [id]
    );
    return res.status(200).json(updated[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('/persona', async (req, res, next) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const existing = await query(`SELECT id FROM persona WHERE usuario_id = ? LIMIT 1`, [usuarioId]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe un perfil para este usuario' });
    }

    const allowed = [
      'nombre',
      'apellido',
      'titulo_profesional',
      'sobre_mi',
      'email_contacto',
      'github_url',
      'linkedin_url',
      'avatar_url',
    ];
    const fields = pickFields(req.body || {}, allowed);

    if (!fields.nombre || !fields.apellido || !fields.titulo_profesional) {
      return res.status(400).json({ error: 'nombre, apellido y titulo_profesional son requeridos' });
    }

    await query(
      `INSERT INTO persona (usuario_id, nombre, apellido, titulo_profesional, sobre_mi, email_contacto, github_url, linkedin_url, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        fields.nombre,
        fields.apellido,
        fields.titulo_profesional,
        fields.sobre_mi ?? null,
        fields.email_contacto ?? null,
        fields.github_url ?? null,
        fields.linkedin_url ?? null,
        fields.avatar_url ?? null,
      ]
    );

    const created = await query(
      `SELECT id, usuario_id, nombre, apellido, titulo_profesional, sobre_mi,
              email_contacto, github_url, linkedin_url, avatar_url
       FROM persona WHERE usuario_id = ? LIMIT 1`,
      [usuarioId]
    );
    return res.status(201).json(created[0]);
  } catch (err) {
    return next(err);
  }
});

// -------------------- Categorías --------------------
router.get('/categorias', async (req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM categorias_habilidades ORDER BY id ASC`);
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

router.post('/categorias', async (req, res, next) => {
  try {
    const { nombre_categoria } = req.body || {};
    if (!nombre_categoria || typeof nombre_categoria !== 'string' || nombre_categoria.trim().length === 0) {
      return res.status(400).json({ error: 'nombre_categoria es requerido' });
    }

    const existing = await query(
      `SELECT id FROM categorias_habilidades WHERE nombre_categoria = ? LIMIT 1`,
      [nombre_categoria.trim()]
    );
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'La categoría ya existe' });
    }

    const result = await query(
      `INSERT INTO categorias_habilidades (nombre_categoria) VALUES (?)`,
      [nombre_categoria.trim()]
    );
    const rows = await query(`SELECT * FROM categorias_habilidades WHERE id = ? LIMIT 1`, [
      result.lastInsertRowid,
    ]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put('/categorias/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre_categoria } = req.body || {};
    if (!nombre_categoria || typeof nombre_categoria !== 'string' || nombre_categoria.trim().length === 0) {
      return res.status(400).json({ error: 'nombre_categoria es requerido' });
    }

    const existing = await query(`SELECT id FROM categorias_habilidades WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const duplicate = await query(
      `SELECT id FROM categorias_habilidades WHERE nombre_categoria = ? AND id != ? LIMIT 1`,
      [nombre_categoria.trim(), id]
    );
    if (duplicate && duplicate.length > 0) {
      return res.status(409).json({ error: 'Ya existe otra categoría con ese nombre' });
    }

    await query(
      `UPDATE categorias_habilidades SET nombre_categoria = ? WHERE id = ?`,
      [nombre_categoria.trim(), id]
    );
    const rows = await query(`SELECT * FROM categorias_habilidades WHERE id = ? LIMIT 1`, [id]);
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/categorias/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM categorias_habilidades WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    await query(`DELETE FROM categorias_habilidades WHERE id = ?`, [id]);
    return res.status(200).json({ ok: true, deleted: id });
  } catch (err) {
    return next(err);
  }
});

// -------------------- Habilidades --------------------
router.get('/habilidades', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT h.id, h.categoria_id, h.nombre, h.nivel_porcentaje, h.icono_url,
              c.nombre_categoria
       FROM habilidades h
       INNER JOIN categorias_habilidades c ON c.id = h.categoria_id
       ORDER BY c.id ASC, h.id ASC`
    );
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

router.post('/habilidades', async (req, res, next) => {
  try {
    const { categoria_id, nombre, nivel_porcentaje, icono_url } = req.body || {};

    if (!categoria_id) {
      return res.status(400).json({ error: 'categoria_id es requerido' });
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'nombre es requerido' });
    }
    if (
      nivel_porcentaje === undefined ||
      nivel_porcentaje === null ||
      isNaN(Number(nivel_porcentaje)) ||
      Number(nivel_porcentaje) < 0 ||
      Number(nivel_porcentaje) > 100
    ) {
      return res
        .status(400)
        .json({ error: 'nivel_porcentaje es requerido y debe estar entre 0 y 100' });
    }

    const catExists = await query(
      `SELECT id FROM categorias_habilidades WHERE id = ? LIMIT 1`,
      [categoria_id]
    );
    if (!catExists || catExists.length === 0) {
      return res.status(400).json({ error: 'categoria_id no existe' });
    }

    const result = await query(
      `INSERT INTO habilidades (categoria_id, nombre, nivel_porcentaje, icono_url) VALUES (?, ?, ?, ?)`,
      [categoria_id, nombre.trim(), Number(nivel_porcentaje), icono_url || null]
    );

    const rows = await query(
      `SELECT h.id, h.categoria_id, h.nombre, h.nivel_porcentaje, h.icono_url,
              c.nombre_categoria
       FROM habilidades h
       INNER JOIN categorias_habilidades c ON c.id = h.categoria_id
       WHERE h.id = ? LIMIT 1`,
      [result.lastInsertRowid]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put('/habilidades/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['categoria_id', 'nombre', 'nivel_porcentaje', 'icono_url'];
    const fields = pickFields(req.body || {}, allowed);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const existing = await query(`SELECT id FROM habilidades WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Habilidad no encontrada' });
    }

    if (fields.categoria_id !== undefined) {
      const catExists = await query(
        `SELECT id FROM categorias_habilidades WHERE id = ? LIMIT 1`,
        [fields.categoria_id]
      );
      if (!catExists || catExists.length === 0) {
        return res.status(400).json({ error: 'categoria_id no existe' });
      }
    }

    if (fields.nivel_porcentaje !== undefined) {
      const np = Number(fields.nivel_porcentaje);
      if (isNaN(np) || np < 0 || np > 100) {
        return res.status(400).json({ error: 'nivel_porcentaje debe estar entre 0 y 100' });
      }
      fields.nivel_porcentaje = np;
    }

    const sql = buildUpdateSql('habilidades', fields, 'WHERE id = ?');
    const params = Object.values(fields);
    params.push(id);
    await query(sql, params);

    const rows = await query(
      `SELECT h.id, h.categoria_id, h.nombre, h.nivel_porcentaje, h.icono_url,
              c.nombre_categoria
       FROM habilidades h
       INNER JOIN categorias_habilidades c ON c.id = h.categoria_id
       WHERE h.id = ? LIMIT 1`,
      [id]
    );
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/habilidades/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM habilidades WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Habilidad no encontrada' });
    }
    await query(`DELETE FROM habilidades WHERE id = ?`, [id]);
    return res.status(200).json({ ok: true, deleted: id });
  } catch (err) {
    return next(err);
  }
});

// -------------------- Experiencias --------------------
router.get('/experiencias', async (req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM experiencias ORDER BY fecha_inicio DESC`);
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

router.post('/experiencias', async (req, res, next) => {
  try {
    const { puesto, empresa, fecha_inicio, fecha_fin, es_actual, descripcion } = req.body || {};

    if (!puesto || typeof puesto !== 'string' || puesto.trim().length === 0) {
      return res.status(400).json({ error: 'puesto es requerido' });
    }
    if (!empresa || typeof empresa !== 'string' || empresa.trim().length === 0) {
      return res.status(400).json({ error: 'empresa es requerida' });
    }
    if (!fecha_inicio) {
      return res.status(400).json({ error: 'fecha_inicio es requerida' });
    }

    const actual = es_actual ? 1 : 0;
    const fin = actual ? null : fecha_fin || null;

    const result = await query(
      `INSERT INTO experiencias (puesto, empresa, fecha_inicio, fecha_fin, es_actual, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [puesto.trim(), empresa.trim(), fecha_inicio, fin, actual, descripcion || null]
    );

    const rows = await query(`SELECT * FROM experiencias WHERE id = ? LIMIT 1`, [result.lastInsertRowid]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put('/experiencias/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['puesto', 'empresa', 'fecha_inicio', 'fecha_fin', 'es_actual', 'descripcion'];
    const fields = pickFields(req.body || {}, allowed);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const existing = await query(`SELECT id FROM experiencias WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }

    if (fields.es_actual !== undefined) {
      fields.es_actual = fields.es_actual ? 1 : 0;
      if (fields.es_actual === 1) {
        fields.fecha_fin = null;
      }
    }

    const sql = buildUpdateSql('experiencias', fields, 'WHERE id = ?');
    const params = Object.values(fields);
    params.push(id);
    await query(sql, params);

    const rows = await query(`SELECT * FROM experiencias WHERE id = ? LIMIT 1`, [id]);
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/experiencias/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM experiencias WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }
    await query(`DELETE FROM experiencias WHERE id = ?`, [id]);
    return res.status(200).json({ ok: true, deleted: id });
  } catch (err) {
    return next(err);
  }
});

// -------------------- Logros --------------------
router.get('/logros', async (req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM logros ORDER BY fecha_obtencion DESC`);
    return res.status(200).json(rows || []);
  } catch (err) {
    return next(err);
  }
});

router.post('/logros', async (req, res, next) => {
  try {
    const { titulo, institucion_o_entidad, fecha_obtencion, descripcion_logro, insignia_url } =
      req.body || {};

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
      return res.status(400).json({ error: 'titulo es requerido' });
    }
    if (
      !institucion_o_entidad ||
      typeof institucion_o_entidad !== 'string' ||
      institucion_o_entidad.trim().length === 0
    ) {
      return res.status(400).json({ error: 'institucion_o_entidad es requerida' });
    }
    if (!fecha_obtencion) {
      return res.status(400).json({ error: 'fecha_obtencion es requerida' });
    }

    const result = await query(
      `INSERT INTO logros (titulo, institucion_o_entidad, fecha_obtencion, descripcion_logro, insignia_url)
       VALUES (?, ?, ?, ?, ?)`,
      [
        titulo.trim(),
        institucion_o_entidad.trim(),
        fecha_obtencion,
        descripcion_logro || null,
        insignia_url || null,
      ]
    );

    const rows = await query(`SELECT * FROM logros WHERE id = ? LIMIT 1`, [result.lastInsertRowid]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put('/logros/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = [
      'titulo',
      'institucion_o_entidad',
      'fecha_obtencion',
      'descripcion_logro',
      'insignia_url',
    ];
    const fields = pickFields(req.body || {}, allowed);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const existing = await query(`SELECT id FROM logros WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Logro no encontrado' });
    }

    const sql = buildUpdateSql('logros', fields, 'WHERE id = ?');
    const params = Object.values(fields);
    params.push(id);
    await query(sql, params);

    const rows = await query(`SELECT * FROM logros WHERE id = ? LIMIT 1`, [id]);
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/logros/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM logros WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Logro no encontrado' });
    }
    await query(`DELETE FROM logros WHERE id = ?`, [id]);
    return res.status(200).json({ ok: true, deleted: id });
  } catch (err) {
    return next(err);
  }
});

// -------------------- Proyectos --------------------
router.get('/proyectos', async (req, res, next) => {
  try {
    const proyectos = await query(
      `SELECT * FROM proyectos ORDER BY destacado DESC, fecha_creacion DESC`
    );
    if (!proyectos || proyectos.length === 0) {
      return res.status(200).json([]);
    }

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

    const result = proyectos.map((p) => ({
      ...p,
      habilidades: habilidadesByProyecto.get(p.id) || [],
    }));
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

router.post('/proyectos', async (req, res, next) => {
  try {
    const {
      titulo,
      descripcion,
      imagen_url,
      demo_url,
      repo_url,
      destacado,
    } = req.body || {};

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
      return res.status(400).json({ error: 'titulo es requerido' });
    }
    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length === 0) {
      return res.status(400).json({ error: 'descripcion es requerida' });
    }
    if (!imagen_url || typeof imagen_url !== 'string' || imagen_url.trim().length === 0) {
      return res.status(400).json({ error: 'imagen_url es requerida' });
    }

    const dest = destacado ? 1 : 0;

    const result = await query(
      `INSERT INTO proyectos (titulo, descripcion, imagen_url, demo_url, repo_url, destacado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        titulo.trim(),
        descripcion.trim(),
        imagen_url.trim(),
        demo_url || null,
        repo_url || null,
        dest,
      ]
    );

    const rows = await query(`SELECT * FROM proyectos WHERE id = ? LIMIT 1`, [result.lastInsertRowid]);
    return res.status(201).json({ ...rows[0], habilidades: [] });
  } catch (err) {
    return next(err);
  }
});

router.put('/proyectos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['titulo', 'descripcion', 'imagen_url', 'demo_url', 'repo_url', 'destacado'];
    const fields = pickFields(req.body || {}, allowed);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const existing = await query(`SELECT id FROM proyectos WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    if (fields.destacado !== undefined) {
      fields.destacado = fields.destacado ? 1 : 0;
    }

    const sql = buildUpdateSql('proyectos', fields, 'WHERE id = ?');
    const params = Object.values(fields);
    params.push(id);
    await query(sql, params);

    const rows = await query(`SELECT * FROM proyectos WHERE id = ? LIMIT 1`, [id]);
    return res.status(200).json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/proyectos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM proyectos WHERE id = ? LIMIT 1`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    await query(`DELETE FROM proyectos WHERE id = ?`, [id]);
    return res.status(200).json({ ok: true, deleted: id });
  } catch (err) {
    return next(err);
  }
});

router.post('/proyectos/:id/habilidades', async (req, res, next) => {
  try {
    const { id: proyectoId } = req.params;
    const { habilidadId, agregar } = req.body || {};

    if (!habilidadId) {
      return res.status(400).json({ error: 'habilidadId es requerido' });
    }
    if (agregar === undefined || agregar === null) {
      return res.status(400).json({ error: 'agregar (true/false) es requerido' });
    }

    const proyectoExists = await query(`SELECT id FROM proyectos WHERE id = ? LIMIT 1`, [proyectoId]);
    if (!proyectoExists || proyectoExists.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const habilidadExists = await query(`SELECT id FROM habilidades WHERE id = ? LIMIT 1`, [habilidadId]);
    if (!habilidadExists || habilidadExists.length === 0) {
      return res.status(400).json({ error: 'habilidadId no existe' });
    }

    if (agregar) {
      try {
        await query(
          `INSERT OR IGNORE INTO proyecto_habilidades (proyecto_id, habilidad_id) VALUES (?, ?)`,
          [proyectoId, habilidadId]
        );
      } catch (e) {
        try {
          await query(
            `INSERT INTO proyecto_habilidades (proyecto_id, habilidad_id) VALUES (?, ?) ON CONFLICT DO NOTHING`,
            [proyectoId, habilidadId]
          );
        } catch (e2) {
          return res.status(409).json({ error: 'No se pudo crear la relación' });
        }
      }
      return res.status(201).json({ ok: true, agregado: true, proyecto_id: proyectoId, habilidad_id: habilidadId });
    } else {
      await query(
        `DELETE FROM proyecto_habilidades WHERE proyecto_id = ? AND habilidad_id = ?`,
        [proyectoId, habilidadId]
      );
      return res.status(200).json({ ok: true, eliminado: true, proyecto_id: proyectoId, habilidad_id: habilidadId });
    }
  } catch (err) {
    return next(err);
  }
});

export default router;
