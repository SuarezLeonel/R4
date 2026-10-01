import { useState, FormEvent } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaArrowRight, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { LoginPayload } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LoginPayload>({ username: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginPayload, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof LoginPayload, string>> = {};
    if (!form.username.trim()) e.username = 'Ingresa tu usuario';
    if (!form.password) e.password = 'Ingresa tu contraseña';
    else if (form.password.length < 4) e.password = 'Contraseña demasiado corta';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      pushToast('success', 'Sesión iniciada correctamente.');
    } catch (err: unknown) {
      const data =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string; error?: string } } }).response?.data
          : undefined;
      const message = data?.message ?? data?.error ?? 'Credenciales inválidas.';
      pushToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-accent-400/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex justify-center sm:justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            <FaArrowLeft size={14} /> Volver al portfolio
          </Link>
        </div>

        <div className="card !p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 px-8 py-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 h-24 w-24 rounded-full border-4 border-white/50" />
              <div className="absolute bottom-4 right-4 h-16 w-16 rounded-full border-4 border-white/40" />
            </div>
            <div className="relative">
              <div className="inline-flex p-4 rounded-2xl bg-white/15 backdrop-blur border border-white/20 mb-4 shadow-lg">
                <FaLock size={28} />
              </div>
              <h1 className="text-2xl font-extrabold mb-1">Panel de Administración</h1>
              <p className="text-white/80 text-sm">Inicia sesión para gestionar tu portfolio</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-5">
            <div>
              <label htmlFor="username" className="label-base">
                Usuario
              </label>
              <div className="relative">
                <FaUser
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  placeholder="admin"
                  className={`input-base pl-10 ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label-base">
                Contraseña
              </label>
              <div className="relative">
                <FaLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-base pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  Iniciando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <FaArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Portfolio Admin. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
}
