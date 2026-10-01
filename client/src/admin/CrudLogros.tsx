import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTrophy } from 'react-icons/fa';
import { Logro } from '../types';
import { apiGet, apiPost, apiPut, apiDel } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/ui/Modal';

const empty: Logro = {
  id: 0,
  titulo: '',
  institucion_o_entidad: '',
  fecha_obtencion: '',
  descripcion_logro: '',
  insignia_url: '',
};

export default function CrudLogros() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<Logro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<Logro>(empty);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Logro, string>>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Logro | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Logro[]>('/admin/logros');
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setFormMode('create');
    setForm({ ...empty, fecha_obtencion: new Date().toISOString().slice(0, 10) });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (l: Logro) => {
    setFormMode('edit');
    setForm({ ...l });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Logro, string>> = {};
    if (!form.titulo.trim()) e.titulo = 'El título es requerido';
    if (!form.institucion_o_entidad.trim()) e.institucion_o_entidad = 'La institución es requerida';
    if (!form.fecha_obtencion) e.fecha_obtencion = 'La fecha es requerida';
    if (!form.descripcion_logro.trim() || form.descripcion_logro.trim().length < 10)
      e.descripcion_logro = 'Describe el logro (mínimo 10 caracteres)';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (formMode === 'create') {
        const created = await apiPost<Logro>('/admin/logros', form);
        setItems((prev) => [...prev, created]);
        pushToast('success', `Logro "${created.titulo}" creado.`);
      } else {
        await apiPut<Logro>(`/admin/logros/${form.id}`, form);
        setItems((prev) => prev.map((i) => (i.id === form.id ? { ...form } : i)));
        pushToast('success', 'Logro actualizado.');
      }
      setFormOpen(false);
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

  const openDelete = (l: Logro) => {
    setTargetDelete(l);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetDelete) return;
    setDeletingId(targetDelete.id);
    try {
      await apiDel(`/admin/logros/${targetDelete.id}`);
      setItems((prev) => prev.filter((i) => i.id !== targetDelete.id));
      pushToast('success', 'Logro eliminado.');
      setConfirmOpen(false);
      setTargetDelete(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data
              ?.message ?? 'Error al eliminar.')
          : 'Error al eliminar.';
      pushToast('error', message);
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaTrophy className="text-primary-600" /> Logros y certificaciones
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Certificaciones, premios y reconocimientos obtenidos.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FaPlus size={14} /> Nuevo logro
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold py-8 justify-center">
          <FaSpinner className="animate-spin" /> Cargando logros...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <FaTrophy className="mx-auto mb-3 text-slate-400" size={32} />
          <p className="font-semibold text-slate-700 dark:text-slate-200">Aún no hay logros</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Añade certificaciones, premios o reconocimientos.
          </p>
          <button onClick={openCreate} className="btn-primary">
            <FaPlus size={14} /> Crear logro
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-semibold">Logro</th>
                <th className="px-4 py-3 font-semibold">Institución</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.fecha_obtencion).getTime() -
                    new Date(a.fecha_obtencion).getTime()
                )
                .map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {l.insignia_url && (
                          <img
                            src={l.insignia_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover bg-white border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {l.titulo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {l.institucion_o_entidad}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {fmt(l.fecha_obtencion)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEdit(l)}
                          className="p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-600/15 transition"
                          title="Editar"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(l)}
                          disabled={deletingId === l.id}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === l.id ? (
                            <FaSpinner className="animate-spin" size={14} />
                          ) : (
                            <FaTrash size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={formMode === 'create' ? 'Nuevo logro' : 'Editar logro'}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="titulo_log" className="label-base">Título *</label>
              <input
                id="titulo_log" type="text" value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Certificación AWS Cloud Practitioner"
                className={`input-base ${formErrors.titulo ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoFocus
              />
              {formErrors.titulo && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.titulo}</p>}
            </div>
            <div>
              <label htmlFor="inst_log" className="label-base">Institución / Entidad *</label>
              <input
                id="inst_log" type="text" value={form.institucion_o_entidad}
                onChange={(e) => setForm({ ...form, institucion_o_entidad: e.target.value })}
                placeholder="Amazon Web Services"
                className={`input-base ${formErrors.institucion_o_entidad ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.institucion_o_entidad && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.institucion_o_entidad}</p>}
            </div>
            <div>
              <label htmlFor="fecha_log" className="label-base">Fecha de obtención *</label>
              <input
                id="fecha_log" type="date" value={form.fecha_obtencion}
                onChange={(e) => setForm({ ...form, fecha_obtencion: e.target.value })}
                className={`input-base ${formErrors.fecha_obtencion ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.fecha_obtencion && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.fecha_obtencion}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="desc_log" className="label-base">Descripción *</label>
              <textarea
                id="desc_log" rows={4} value={form.descripcion_logro}
                onChange={(e) => setForm({ ...form, descripcion_logro: e.target.value })}
                placeholder="Describe el logro, duración, temática y aprendizajes..."
                className={`input-base resize-y ${formErrors.descripcion_logro ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <div className="flex justify-between mt-1">
                {formErrors.descripcion_logro ? (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.descripcion_logro}</p>
                ) : <span />}
                <span className="text-xs text-slate-400">{form.descripcion_logro.length} caracteres</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ins_log" className="label-base">URL insignia (opcional)</label>
              <input
                id="ins_log" type="url" value={form.insignia_url ?? ''}
                onChange={(e) => setForm({ ...form, insignia_url: e.target.value })}
                placeholder="https://.../insignia.png"
                className="input-base"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} disabled={saving} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
              {saving ? (
                <><FaSpinner className="animate-spin" size={14} /> Guardando...</>
              ) : (
                <><FaSave size={14} /> Guardar</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => !deletingId && setConfirmOpen(false)}
        title="Eliminar logro"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            ¿Eliminar el logro{' '}
            <span className="font-bold text-red-600 dark:text-red-400">
              "{targetDelete?.titulo}"
            </span>
            ?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setConfirmOpen(false)} disabled={!!deletingId} className="btn-outline">
              Cancelar
            </button>
            <button onClick={confirmDelete} disabled={!!deletingId} className="btn-primary !bg-red-600 hover:!bg-red-700 min-w-[140px]">
              {deletingId ? (
                <><FaSpinner className="animate-spin" size={14} /> Eliminando...</>
              ) : (
                <><FaTrash size={14} /> Eliminar</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
