import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaBriefcase } from 'react-icons/fa';
import { Experiencia } from '../types';
import { apiGet, apiPost, apiPut, apiDel } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/ui/Modal';

const empty: Experiencia = {
  id: 0,
  puesto: '',
  empresa: '',
  fecha_inicio: '',
  fecha_fin: null,
  es_actual: false,
  descripcion: '',
};

export default function CrudExperiencias() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<Experiencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<Experiencia>(empty);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Experiencia, string>>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Experiencia | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Experiencia[]>('/admin/experiencias');
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
    setForm({ ...empty });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (e: Experiencia) => {
    setFormMode('edit');
    setForm({ ...e });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Experiencia, string>> = {};
    if (!form.puesto.trim()) e.puesto = 'El puesto es requerido';
    if (!form.empresa.trim()) e.empresa = 'La empresa es requerida';
    if (!form.fecha_inicio) e.fecha_inicio = 'Fecha de inicio es requerida';
    if (!form.es_actual && !form.fecha_fin) e.fecha_fin = 'Indica fecha fin o marca como actual';
    if (
      form.fecha_inicio &&
      form.fecha_fin &&
      new Date(form.fecha_inicio) > new Date(form.fecha_fin)
    ) {
      e.fecha_fin = 'Fecha fin debe ser posterior a la de inicio';
    }
    if (!form.descripcion.trim() || form.descripcion.trim().length < 10)
      e.descripcion = 'Describe tu experiencia (mínimo 10 caracteres)';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, fecha_fin: form.es_actual ? null : form.fecha_fin };
    try {
      if (formMode === 'create') {
        const created = await apiPost<Experiencia>('/admin/experiencias', payload);
        setItems((prev) => [...prev, created]);
        pushToast('success', `Experiencia "${created.puesto}" creada.`);
      } else {
        await apiPut<Experiencia>(`/admin/experiencias/${form.id}`, payload);
        setItems((prev) => prev.map((i) => (i.id === form.id ? { ...payload, id: form.id } : i)));
        pushToast('success', 'Experiencia actualizada.');
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

  const openDelete = (e: Experiencia) => {
    setTargetDelete(e);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetDelete) return;
    setDeletingId(targetDelete.id);
    try {
      await apiDel(`/admin/experiencias/${targetDelete.id}`);
      setItems((prev) => prev.filter((i) => i.id !== targetDelete.id));
      pushToast('success', 'Experiencia eliminada.');
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

  const fmt = (d: string | null) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaBriefcase className="text-primary-600" /> Experiencia laboral
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tu trayectoria profesional, ordenada cronológicamente.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FaPlus size={14} /> Nueva experiencia
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold py-8 justify-center">
          <FaSpinner className="animate-spin" /> Cargando experiencias...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <FaBriefcase className="mx-auto mb-3 text-slate-400" size={32} />
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Aún no hay experiencias
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Añade tus puestos de trabajo y roles anteriores.
          </p>
          <button onClick={openCreate} className="btn-primary">
            <FaPlus size={14} /> Crear experiencia
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-semibold">Puesto</th>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Periodo</th>
                <th className="px-4 py-3 font-semibold text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
                )
                .map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {e.puesto}
                        </span>
                        {e.es_actual && (
                          <span className="tag !bg-emerald-50 dark:!bg-emerald-900/30 !text-emerald-700 dark:!text-emerald-300">
                            Actual
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{e.empresa}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap text-sm">
                      {fmt(e.fecha_inicio)} —{' '}
                      {e.es_actual ? 'Actualidad' : fmt(e.fecha_fin)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-600/15 transition"
                          title="Editar"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(e)}
                          disabled={deletingId === e.id}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === e.id ? (
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
        title={formMode === 'create' ? 'Nueva experiencia' : 'Editar experiencia'}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="puesto_exp" className="label-base">Puesto *</label>
              <input
                id="puesto_exp" type="text" value={form.puesto}
                onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                placeholder="Desarrollador Full Stack"
                className={`input-base ${formErrors.puesto ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoFocus
              />
              {formErrors.puesto && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.puesto}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="empresa_exp" className="label-base">Empresa *</label>
              <input
                id="empresa_exp" type="text" value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                placeholder="Nombre de la empresa"
                className={`input-base ${formErrors.empresa ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.empresa && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.empresa}</p>}
            </div>
            <div>
              <label htmlFor="fi_exp" className="label-base">Fecha inicio *</label>
              <input
                id="fi_exp" type="month" value={form.fecha_inicio.slice(0, 7)}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value ? `${e.target.value}-01` : '' })}
                className={`input-base ${formErrors.fecha_inicio ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.fecha_inicio && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.fecha_inicio}</p>}
            </div>
            <div>
              <label htmlFor="ff_exp" className="label-base">
                Fecha fin {!form.es_actual && '*'}
              </label>
              <input
                id="ff_exp" type="month"
                value={form.fecha_fin ? form.fecha_fin.slice(0, 7) : ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fecha_fin: e.target.value ? `${e.target.value}-01` : null,
                    es_actual: false,
                  })
                }
                disabled={form.es_actual}
                className={`input-base disabled:bg-slate-100 dark:disabled:bg-slate-800 ${formErrors.fecha_fin ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <label className="inline-flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary-600 rounded"
                  checked={form.es_actual}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm({ ...form, es_actual: checked, fecha_fin: checked ? null : form.fecha_fin });
                  }}
                />
                Es mi puesto actual
              </label>
              {formErrors.fecha_fin && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.fecha_fin}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="desc_exp" className="label-base">Descripción *</label>
              <textarea
                id="desc_exp" rows={5} value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Describe tus responsabilidades, logros y tecnologías utilizadas..."
                className={`input-base resize-y ${formErrors.descripcion ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <div className="flex justify-between mt-1">
                {formErrors.descripcion ? (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.descripcion}</p>
                ) : <span />}
                <span className="text-xs text-slate-400">{form.descripcion.length} caracteres</span>
              </div>
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
        title="Eliminar experiencia"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            ¿Eliminar la experiencia{' '}
            <span className="font-bold text-red-600 dark:text-red-400">
              "{targetDelete?.puesto} en {targetDelete?.empresa}"
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
