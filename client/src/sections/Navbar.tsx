import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { FaSun, FaMoon, FaBars, FaTimes, FaUserShield } from 'react-icons/fa';
import { Persona } from '../types';

/**
 * Propiedades de Navbar: datos de persona opcionales para poblar el brand.
 */
interface NavbarProps {
  persona?: Persona | null;
}

/**
 * Links de navegación (escritorio y móvil). Cada uno tiene un `id` que coincide
 * con el atributo `id` de la sección a la que se hace scroll smooth.
 * La sección "Proyectos" fue removida completamente del flujo público.
 */
const navLinks = [
  { id: 'hero', label: 'Inicio' },
  { id: 'about', label: 'Sobre mí' },
  { id: 'skills', label: 'Habilidades' },
  { id: 'experience', label: 'Experiencia' },
  { id: 'achievements', label: 'Logros' },
];

/**
 * Barra de navegación superior (sticky). Responsiva con menú hamburguesa en móvil.
 *
 * Características:
 * - Brand clickable con nombre + título (sube al top, id='hero')
 * - Links alineados en escritorio / drawer colapsable en móvil
 * - Toggle de tema claro/oscuro (consume `ThemeContext`)
 * - Botón "Admin" visible siempre; redirige a /admin si no hay sesión
 *   o a /admin/dashboard si el usuario ya está autenticado
 * - Efecto visual dinámico al hacer scroll (vía `scrolled`)
 */
export default function Navbar({ persona }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const adminPath = isAuthenticated ? '/admin/dashboard' : '/admin';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /**
   * Listener de scroll para aplicar efecto visual en el sticky header.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Hace scroll suave a una sección y (si corresponde) cierra el menú móvil.
   */
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  };

  const nombre = persona ? `${persona.nombre} ${persona.apellido}` : 'Mi Portfolio';
  const titulo = persona?.titulo_profesional ?? 'Desarrollador';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 border-slate-200/60 dark:border-slate-800/60'
          : 'bg-white/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => handleScroll('hero')}
            className="flex flex-col items-start text-left group"
          >
            <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-500 transition">
              {nombre}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 -mt-0.5">
              {titulo}
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScroll(link.id)}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-primary-600 dark:hover:text-primary-400 transition"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            <button
              onClick={() => navigate(adminPath)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-600/10 border border-primary-200 dark:border-primary-800/50 transition"
            >
              <FaUserShield size={14} />
              Admin
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Menú"
            >
              {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-2 border-t border-slate-200 dark:border-slate-800 pt-4 animate-fadeIn">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleScroll(link.id)}
                  className="text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate(adminPath);
                  setMobileOpen(false);
                }}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-600/10 border border-primary-200 dark:border-primary-800/50 transition"
              >
                <FaUserShield size={14} />
                Panel de administración
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
