import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaThList } from 'react-icons/fa';
import { Categoria } from '../types';
import { apiGet, apiPost, apiPut, apiDel } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/ui/Modal';

const empty: Categoria = { id: 0, nombre_categoria: '' };

export default function CrudCategorias() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<Categoria>(empty);
  const [formError, setFormError] = useState<string | undefined>();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Categoria | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Categoria[]>('/admin/categorias');
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
    setForm(empty);
    setFormError(undefined);
    setFormOpen(true);
  };

  const openEdit = (c: Categoria) => {
    setFormMode('edit');
    setForm({ ...c });
    setFormError(undefined);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre_categoria.trim()) {
      setFormError('El nombre de la categoría es requerido.');
      return;
    }
    setSaving(true);
    try {
      if (formMode === 'create') {
        const created = await apiPost<Categoria>('/admin/categorias', form);
        setItems((prev) => [...prev, created]);
        pushToast('success', `Categoría "${created.nombre_categoria}" creada.`);
      } else {
        await apiPut<Categoria>(`/admin/categorias/${form.id}`, form);
        setItems((prev) => prev.map((i) => (i.id === form.id ? { ...form } : i)));
        pushToast('success', 'Categoría actualizada.');
      }
      setFormOpen(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data
              ?.message ?? 'Error al guardar.')
          : 'Error al guardar.';
      setFormError(message);
      pushToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (c: Categoria) => {
    setTargetDelete(c);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetDelete) return;
    setDeletingId(targetDelete.id);
    try {
      await apiDel(`/admin/categorias/${targetDelete.id}`);
      setItems((prev) => prev.filter((i) => i.id !== targetDelete.id));
      pushToast('success', 'Categoría eliminada correctamente.');
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

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaThList className="text-primary-600" /> Categorías de habilidades
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Clasifica tus habilidades por grupos temáticos.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FaPlus size={14} /> Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold py-8 justify-center">
          <FaSpinner className="animate-spin" /> Cargando categorías...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <FaThList className="mx-auto mb-3 text-slate-400" size={32} />
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Aún no hay categorías
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Crea la primera para organizar tus habilidades.
          </p>
          <button onClick={openCreate} className="btn-primary">
            <FaPlus size={14} /> Crear categoría
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold text-right w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-200">
                    {c.nombre_categoria}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-600/15 transition"
                        title="Editar"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => openDelete(c)}
                        disabled={deletingId === c.id}
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                        title="Eliminar"
                      >
                        {deletingId === c.id ? (
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
        title={formMode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="nombre_categoria" className="label-base">
              Nombre de la categoría *
            </label>
            <input
              id="nombre_categoria"
              name="nombre_categoria"
              type="text"
              value={form.nombre_categoria}
              onChange={(e) => {
                setForm({ ...form, nombre_categoria: e.target.value });
                setFormError(undefined);
              }}
              placeholder="Frontend, Backend, DevOps..."
              className="input-base"
              autoFocus
            />
            {formError && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {formError}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" size={14} /> Guardando...
                </>
              ) : (
                <>
                  <FaSave size={14} /> Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => !deletingId && setConfirmOpen(false)}
        title="Eliminar categoría"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 p-4">
            <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex-shrink-0">
              <FaTrash />
            </div>
            <div>
              <p className="font-bold text-red-800 dark:text-red-200 mb-1">
                ¿Eliminar "{targetDelete?.nombre_categoria}"?
              </p>
              <p className="text-sm text-red-700/90 dark:text-red-300/90">
                Esta acción no se puede deshacer. Las habilidades vinculadas podrían quedar sin
                categoría.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={!!deletingId}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={!!deletingId}
              className="btn-primary !bg-red-600 hover:!bg-red-700 min-w-[140px]"
            >
              {deletingId ? (
                <>
                  <FaSpinner className="animate-spin" size={14} /> Eliminando...
                </>
              ) : (
                <>
                  <FaTrash size={14} /> Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
