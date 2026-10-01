import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaThList,
  FaCogs,
  FaBriefcase,
  FaTrophy,
  FaFolderOpen,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import Modal from '../components/ui/Modal';
import CrudPersona from '../admin/CrudPersona';
import CrudCategorias from '../admin/CrudCategorias';
import CrudHabilidades from '../admin/CrudHabilidades';
import CrudExperiencias from '../admin/CrudExperiencias';
import CrudLogros from '../admin/CrudLogros';

/**
 * Claves válidas para las secciones del panel de administración.
 * La sección `proyectos` fue removida del flujo público.
 */
type SectionKey =
  | 'persona'
  | 'categorias'
  | 'habilidades'
  | 'experiencias'
  | 'logros';

/**
 * Catálogo de secciones del sidebar. La key es la que usa `SectionKey`.
 */
const sections: { key: SectionKey; label: string; icon: JSX.Element }[] = [
  { key: 'persona', label: 'Persona', icon: <FaUser /> },
  { key: 'categorias', label: 'Categorías', icon: <FaThList /> },
  { key: 'habilidades', label: 'Habilidades', icon: <FaCogs /> },
  { key: 'experiencias', label: 'Experiencias', icon: <FaBriefcase /> },
  { key: 'logros', label: 'Logros', icon: <FaTrophy /> },
];

/**
 * Panel principal de administración (`/admin/dashboard`).
 *
 * Layout:
 * - Desktop: Sidebar fijo a la izquierda + contenido principal a la derecha
 * - Mobile: Top-bar sticky + drawer lateral animado (con backdrop)
 *
 * Contiene:
 * - Switcher de secciones (5 CRUDs). El render lo decide `renderSection()`.
 * - Acceso rápido para "Ver página pública" en 4 puntos: sidebar escritorio,
 *   topbar móvil, drawer móvil y header del contenido.
 * - Info del usuario autenticado + botones de Tema y Salir.
 * - Modal de confirmación antes de cerrar sesión.
 * - Animaciones en los cambios de sección (AnimatePresence).
 */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [active, setActive] = useState<SectionKey>('persona');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  /** Abre el modal de confirmación para logout. */
  const handleLogout = () => {
    setConfirmLogoutOpen(true);
  };

  /**
   * Confirma logout: limpia sesión, muestra toast y redirige a `/admin`
   * (reemplazando el history para no volver atrás con el botón del navegador).
   */
  const confirmLogout = () => {
    logout();
    setConfirmLogoutOpen(false);
    pushToast('info', 'Sesión cerrada correctamente.');
    navigate('/admin', { replace: true });
  };

  /** Cambia la sección activa y cierra el menú móvil (si está abierto). */
  const select = (k: SectionKey) => {
    setActive(k);
    setMobileOpen(false);
  };

  /**
   * Renderiza el componente CRUD correspondiente a la sección activa.
   * Usa un switch exhaustivo (todas las keys de SectionKey están cubiertas).
   */
  const renderSection = () => {
    switch (active) {
      case 'persona':
        return <CrudPersona />;
      case 'categorias':
        return <CrudCategorias />;
      case 'habilidades':
        return <CrudHabilidades />;
      case 'experiencias':
        return <CrudExperiencias />;
      case 'logros':
        return <CrudLogros />;
    }
  };

  const currentSection = sections.find((s) => s.key === active);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md">
                <FaFolderOpen />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white leading-tight">
                  Portfolio
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                  Panel admin
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Accesos rápidos
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-600/15 hover:bg-primary-100 dark:hover:bg-primary-600/25 shadow-sm"
            >
              <span className="text-primary-600 dark:text-primary-400">
                <FaExternalLinkAlt size={14} />
              </span>
              Ver página pública
            </button>
            <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Contenido
            </p>
            {sections.map((s) => {
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => select(s.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-600/15 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.icon}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                <FaUserCircle size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user?.username ?? 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email ?? ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title="Cambiar tema"
              >
                {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
              >
                <FaSignOutAlt size={14} />
                Salir
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar móvil */}
          <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Menú"
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white text-sm shadow">
                  <FaFolderOpen />
                </div>
                <span className="font-bold text-sm">Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-600/15 text-primary-600 dark:text-primary-400 transition"
                title="Ver página pública"
              >
                <FaExternalLinkAlt size={14} />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition"
                title="Cerrar sesión"
              >
                <FaSignOutAlt size={14} />
              </button>
            </div>
          </header>

          {/* Drawer móvil */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileOpen(false)}
                  className="md:hidden fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm"
                />
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="md:hidden fixed z-40 top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col"
                >
                  <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md">
                        <FaFolderOpen />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">
                          Portfolio
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Panel admin</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Accesos rápidos
                    </p>
                    <button
                      onClick={() => {
                        navigate('/');
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-600/15"
                    >
                      <FaExternalLinkAlt size={14} />
                      Ver página pública
                    </button>
                    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Contenido
                    </p>
                    {sections.map((s) => {
                      const isActive = active === s.key;
                      return (
                        <button
                          key={s.key}
                          onClick={() => select(s.key)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-600/15 text-primary-700 dark:text-primary-300'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {s.icon}
                          {s.label}
                        </button>
                      );
                    })}
                  </nav>
                  <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                        <FaUserCircle size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
                  Panel de administración
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="text-primary-600 dark:text-primary-400">
                    {currentSection?.icon}
                  </span>
                  Gestión de {currentSection?.label}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Administra el contenido visible en tu portfolio público.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-600/10 hover:border-primary-200 dark:hover:border-primary-700/40 shadow-sm transition"
              >
                <FaExternalLinkAlt size={14} />
                Ver página pública
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Modal
        open={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        title="Confirmar cierre de sesión"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-5">
          <p className="text-slate-600 dark:text-slate-300">
            ¿Estás seguro que deseas cerrar la sesión? Deberás volver a ingresar tus credenciales
            para acceder al panel.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              onClick={() => setConfirmLogoutOpen(false)}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button onClick={confirmLogout} className="btn-primary !bg-red-600 hover:!bg-red-700">
              <FaSignOutAlt size={14} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
