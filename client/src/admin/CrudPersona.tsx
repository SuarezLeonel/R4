import { useEffect, useState } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';
import { Persona } from '../types';
import { apiGet, apiPut, apiPost } from '../services/api';
import { useToast } from '../contexts/ToastContext';

/**
 * Estado inicial (esquema vacío) para el formulario de Persona.
 * `id=0` significa "aún no creado" (el handler usará POST en ese caso).
 * Nota: el campo `cv_url` fue removido completamente del flujo.
 */
const emptyPersona: Persona = {
  id: 0,
  nombre: '',
  apellido: '',
  titulo_profesional: '',
  sobre_mi: '',
  email_contacto: '',
  github_url: '',
  linkedin_url: '',
  avatar_url: '',
};

/**
 * CRUD de datos personales en el panel de administración.
 *
 * Comportamiento:
 * - Al montar: carga el único registro de persona (GET /admin/persona).
 * - Rechaza campos requeridos via `validate()` antes de persistir.
 * - Actualiza si `form.id > 0` (PUT /admin/persona/:id), o crea uno nuevo
 *   (POST /admin/persona) para el usuario autenticado.
 * - Muestra feedback de éxito/error via ToastContext.
 */
export default function CrudPersona() {
  const { pushToast } = useToast();
  const [form, setForm] = useState<Persona>(emptyPersona);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Persona, string>>>({});

  /**
   * Carga inicial de la persona existente. Usa `cancelled` para evitar
   * setState después de un unmount temprano.
   */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiGet<Persona | Persona[]>('/admin/persona');
        const data = Array.isArray(res) ? res[0] ?? emptyPersona : res ?? emptyPersona;
        if (!cancelled) setForm(data);
      } catch {
        if (!cancelled) setForm(emptyPersona);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** onChange genérico para inputs y textareas del formulario. */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /**
   * Validación cliente-side de los campos obligatorios.
   * @returns `true` si el formulario es válido, `false` si hay errores.
   */
  const validate = (): boolean => {
    const e: Partial<Record<keyof Persona, string>> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.apellido.trim()) e.apellido = 'El apellido es requerido';
    if (!form.titulo_profesional.trim())
      e.titulo_profesional = 'El título profesional es requerido';
    if (!form.sobre_mi.trim() || form.sobre_mi.trim().length < 10)
      e.sobre_mi = 'Cuéntanos más sobre ti (mínimo 10 caracteres)';
    if (!form.email_contacto.trim())
      e.email_contacto = 'El email de contacto es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_contacto.trim()))
      e.email_contacto = 'Ingresa un email válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
   * Submit: decide POST vs PUT por medio de `form.id`. Persiste el payload
   * tal cual está (ya fue filtrado por el backend vía whitelist).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      pushToast('error', 'Revisa los campos del formulario.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.id && payload.id > 0) {
        await apiPut<Persona>(`/admin/persona/${payload.id}`, payload);
      } else {
        const created = await apiPost<Persona>('/admin/persona', payload);
        setForm(created);
      }
      pushToast('success', 'Datos personales guardados correctamente.');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data
              ?.message ?? 'Error al guardar.')
          : 'Error al guardar.';
      pushToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold">
          <FaSpinner className="animate-spin" /> Cargando datos personales...
        </div>
      </div>
    );
  }

  /** Helper: devuelve clases CSS de error para un campo dado. */
  const inputErr = (field: keyof Persona) =>
    errors[field] ? 'border-red-500 focus:ring-red-500' : '';

  return (
    <form onSubmit={handleSubmit} noValidate className="card">
      <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">
        Información personal
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Estos datos aparecerán en la sección principal de tu portfolio.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="nombre" className="label-base">Nombre *</label>
          <input
            id="nombre" name="nombre" type="text" value={form.nombre}
            onChange={handleChange} placeholder="Juan"
            className={`input-base ${inputErr('nombre')}`}
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.nombre}</p>}
        </div>
        <div>
          <label htmlFor="apellido" className="label-base">Apellido *</label>
          <input
            id="apellido" name="apellido" type="text" value={form.apellido}
            onChange={handleChange} placeholder="Pérez"
            className={`input-base ${inputErr('apellido')}`}
          />
          {errors.apellido && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.apellido}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="titulo_profesional" className="label-base">Título profesional *</label>
          <input
            id="titulo_profesional" name="titulo_profesional" type="text"
            value={form.titulo_profesional} onChange={handleChange}
            placeholder="Desarrollador Full Stack"
            className={`input-base ${inputErr('titulo_profesional')}`}
          />
          {errors.titulo_profesional && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.titulo_profesional}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sobre_mi" className="label-base">Sobre mí *</label>
          <textarea
            id="sobre_mi" name="sobre_mi" rows={6} value={form.sobre_mi}
            onChange={handleChange} placeholder="Cuenta tu historia, experiencia y enfoque profesional..."
            className={`input-base resize-y ${inputErr('sobre_mi')}`}
          />
          <div className="flex justify-between mt-1">
            {errors.sobre_mi
              ? <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.sobre_mi}</p>
              : <span />}
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {form.sobre_mi.length} caracteres
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="email_contacto" className="label-base">Email de contacto *</label>
          <input
            id="email_contacto" name="email_contacto" type="email"
            value={form.email_contacto} onChange={handleChange}
            placeholder="tu@email.com"
            className={`input-base ${inputErr('email_contacto')}`}
          />
          {errors.email_contacto && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.email_contacto}</p>}
        </div>
        <div>
          <label htmlFor="github_url" className="label-base">GitHub URL</label>
          <input
            id="github_url" name="github_url" type="url" value={form.github_url ?? ''}
            onChange={handleChange} placeholder="https://github.com/tuusuario"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="linkedin_url" className="label-base">LinkedIn URL</label>
          <input
            id="linkedin_url" name="linkedin_url" type="url" value={form.linkedin_url ?? ''}
            onChange={handleChange} placeholder="https://linkedin.com/in/tuusuario"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="avatar_url" className="label-base">Avatar URL</label>
          <input
            id="avatar_url" name="avatar_url" type="url" value={form.avatar_url ?? ''}
            onChange={handleChange} placeholder="https://.../avatar.jpg"
            className="input-base"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary min-w-[180px]">
          {saving ? (
            <><FaSpinner className="animate-spin" /> Guardando...</>
          ) : (
            <><FaSave /> Guardar cambios</>
          )}
        </button>
      </div>
    </form>
  );
}
