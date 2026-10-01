import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Persona } from '../types';

/**
 * Propiedades del componente Hero.
 */
interface HeroProps {
  persona: Persona | null;
}

/**
 * Sección superior (Hero) del portfolio.
 *
 * Muestra la identidad principal del usuario:
 * - Avatar con borde degradé animado
 * - Saludo + Nombre completo
 * - Título profesional
 * - Iconos de redes sociales (GitHub / LinkedIn) cuando existen
 *
 * Los datos se reciben por props (inyección) desde la página contenedora.
 * Las animaciones son entradas escalonadas gestionadas por Framer Motion.
 *
 * NOTA: Botones de "Ver proyectos", "Ver habilidades" y "Descargar CV" fueron
 * removidos según requerimientos de diseño (el CV ya no forma parte del flujo público).
 */
export default function Hero({ persona }: HeroProps) {
  const nombreCompleto = persona
    ? `${persona.nombre} ${persona.apellido}`
    : 'Nombre Apellido';
  const titulo = persona?.titulo_profesional ?? 'Desarrollador Full Stack';
  const avatar =
    persona?.avatar_url ??
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=retrato%20profesional%20desarrollador%20tech%20fondo%20suave&image_size=square_hd';

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-950 dark:via-slate-950 dark:to-primary-950/30" />
      <div className="absolute top-20 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-500/10" />
      <div className="container-page pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="grid md:grid-cols-[auto_1fr] items-center gap-8 sm:gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto md:mx-0"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 opacity-75 blur" />
              <img
                src={avatar}
                alt={nombreCompleto}
                className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl"
              />
            </div>
          </motion.div>

          <div className="text-center md:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-primary-600 dark:text-primary-400 font-semibold mb-2"
            >
              ¡Hola! 👋 Soy
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4"
            >
              {nombreCompleto}
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-xl sm:text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-8"
            >
              {titulo}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center justify-center md:justify-start gap-4"
            >
              {persona?.github_url && (
                <a
                  href={persona.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white dark:bg-slate-900 shadow border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:-translate-y-0.5 transition"
                  aria-label="GitHub"
                >
                  <FaGithub size={20} />
                </a>
              )}
              {persona?.linkedin_url && (
                <a
                  href={persona.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white dark:bg-slate-900 shadow border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:-translate-y-0.5 transition"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={20} />
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
