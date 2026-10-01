import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { Persona } from '../types';

interface FooterProps {
  persona?: Persona | null;
}

export default function Footer({ persona }: FooterProps) {
  const year = new Date().getFullYear();
  const nombre = persona ? `${persona.nombre} ${persona.apellido}` : 'Mi Portfolio';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{nombre}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {persona?.titulo_profesional ?? 'Desarrollador de software'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {persona?.github_url && (
              <a
                href={persona.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
            )}
            {persona?.linkedin_url && (
              <a
                href={persona.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            )}
            {persona?.email_contacto && (
              <a
                href={`mailto:${persona.email_contacto}`}
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition"
                aria-label="Email"
              >
                <FaEnvelope />
              </a>
            )}
          </div>

          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            © {year} {nombre}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
