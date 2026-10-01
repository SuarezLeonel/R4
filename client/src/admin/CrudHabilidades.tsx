import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaCogs } from 'react-icons/fa';
import { Habilidad, Categoria } from '../types';
import { apiGet, apiPost, apiPut, apiDel } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/ui/Modal';

const empty: Habilidad = {
  id: 0,
  categoria_id: 0,
  nombre: '',
  nivel_porcentaje: 80,
  icono_url: '',
};

export default function CrudHabilidades() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<Habilidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<Habilidad>(empty);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Habilidad, string>>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Habilidad | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [habilidadesData, categoriasData] = await Promise.all([
        apiGet<Habilidad[]>('/admin/habilidades').catch(() => [] as Habilidad[]),
        apiGet<Categoria[]>('/admin/categorias').catch(() => [] as Categoria[]),
      ]);
      setItems(Array.isArray(habilidadesData) ? habilidadesData : []);
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setFormMode('create');
    setForm({ ...empty, categoria_id: categorias[0]?.id ?? 0 });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (h: Habilidad) => {
    setFormMode('edit');
    setForm({ ...h });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Habilidad, string>> = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre es requerido';
    if (!form.categoria_id) e.categoria_id = 'Selecciona una categoría';
    if (
      isNaN(form.nivel_porcentaje) ||
      form.nivel_porcentaje < 0 ||
      form.nivel_porcentaje > 100
    ) {
      e.nivel_porcentaje = 'Nivel debe ser entre 0 y 100';
    }
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (formMode === 'create') {
        const created = await apiPost<Habilidad>('/admin/habilidades', form);
        setItems((prev) => [...prev, created]);
        pushToast('success', `Habilidad "${created.nombre}" creada.`);
      } else {
        await apiPut<Habilidad>(`/admin/habilidades/${form.id}`, form);
        setItems((prev) => prev.map((i) => (i.id === form.id ? { ...form } : i)));
        pushToast('success', 'Habilidad actualizada.');
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

  const openDelete = (h: Habilidad) => {
    setTargetDelete(h);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetDelete) return;
    setDeletingId(targetDelete.id);
    try {
      await apiDel(`/admin/habilidades/${targetDelete.id}`);
      setItems((prev) => prev.filter((i) => i.id !== targetDelete.id));
      pushToast('success', 'Habilidad eliminada.');
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

  const catLabel = (id: number) =>
    categorias.find((c) => c.id === id)?.nombre_categoria ?? '—';

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaCogs className="text-primary-600" /> Habilidades
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tecnologías y herramientas que dominas.
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={categorias.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          title={categorias.length === 0 ? 'Crea una categoría primero' : ''}
        >
          <FaPlus size={14} /> Nueva habilidad
        </button>
      </div>

      {categorias.length === 0 && !loading && (
        <div className="mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 text-sm text-amber-800 dark:text-amber-200">
          <span className="font-semibold">Aviso:</span> Crea al menos una categoría antes de
          añadir habilidades.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold py-8 justify-center">
          <FaSpinner className="animate-spin" /> Cargando habilidades...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <FaCogs className="mx-auto mb-3 text-slate-400" size={32} />
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Aún no hay habilidades
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Añade tecnologías para mostrar tu expertise.
          </p>
          {categorias.length > 0 && (
            <button onClick={openCreate} className="btn-primary">
              <FaPlus size={14} /> Crear habilidad
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold w-40">Nivel</th>
                <th className="px-4 py-3 font-semibold text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {h.icono_url && (
                        <img
                          src={h.icono_url}
                          alt=""
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {h.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="tag">{catLabel(h.categoria_id)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                          style={{ width: `${h.nivel_porcentaje}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400 w-10 text-right">
                        {h.nivel_porcentaje}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openEdit(h)}
                        className="p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-600/15 transition"
                        title="Editar"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => openDelete(h)}
                        disabled={deletingId === h.id}
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                        title="Eliminar"
                      >
                        {deletingId === h.id ? (
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
        title={formMode === 'create' ? 'Nueva habilidad' : 'Editar habilidad'}
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="nombre_hab" className="label-base">Nombre *</label>
              <input
                id="nombre_hab" type="text" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="React, Node.js, SQL..."
                className={`input-base ${formErrors.nombre ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoFocus
              />
              {formErrors.nombre && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.nombre}</p>}
            </div>
            <div>
              <label htmlFor="categoria_id_hab" className="label-base">Categoría *</label>
              <select
                id="categoria_id_hab" value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: Number(e.target.value) })}
                className={`input-base ${formErrors.categoria_id ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value={0}>Selecciona una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre_categoria}
                  </option>
                ))}
              </select>
              {formErrors.categoria_id && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.categoria_id}</p>}
            </div>
            <div>
              <label htmlFor="nivel_hab" className="label-base">
                Nivel (%) *: <span className="font-bold text-primary-600 dark:text-primary-400">{form.nivel_porcentaje}%</span>
              </label>
              <input
                id="nivel_hab" type="range" min={0} max={100} step={5}
                value={form.nivel_porcentaje}
                onChange={(e) => setForm({ ...form, nivel_porcentaje: Number(e.target.value) })}
                className="w-full accent-primary-600"
              />
              <input
                type="number" min={0} max={100} value={form.nivel_porcentaje}
                onChange={(e) => setForm({ ...form, nivel_porcentaje: Number(e.target.value) })}
                className="input-base mt-2 text-center"
              />
              {formErrors.nivel_porcentaje && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.nivel_porcentaje}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="icono_url_hab" className="label-base">URL del icono (opcional)</label>
              <input
                id="icono_url_hab" type="url" value={form.icono_url ?? ''}
                onChange={(e) => setForm({ ...form, icono_url: e.target.value })}
                placeholder="https://.../icon.svg"
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
        title="Eliminar habilidad"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            ¿Estás seguro de eliminar la habilidad{' '}
            <span className="font-bold text-red-600 dark:text-red-400">
              "{targetDelete?.nombre}"
            </span>
            ? Esta acción no se puede deshacer.
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
