import { motion } from 'framer-motion';
import { FaBriefcase, FaAward, FaCalendarAlt } from 'react-icons/fa';
import { Persona, Experiencia, Logro } from '../types';

/**
 * Propiedades de la sección "Sobre mí".
 * Todos los datos se inyectan por props desde la página principal.
 */
interface AboutProps {
  persona: Persona | null;
  experiencias: Experiencia[];
  logros: Logro[];
}

/**
 * Calcula los años totales de experiencia laboral con base en la fecha de
 * inicio más temprana del arreglo de experiencias. Considera un año bisiesto
 * cada 4 y devuelve al menos 1 si existen fechas válidas.
 *
 * @param startDates Arreglo de fechas (string) en formato parseable por Date.
 * @returns Años de experiencia (entero, >= 1 si hay datos, 0 si no).
 */
function calculateYears(startDates: string[]): number {
  if (startDates.length === 0) return 0;
  const min = startDates
    .map((d) => new Date(d).getTime())
    .filter((t) => !isNaN(t))
    .sort((a, b) => a - b)[0];
  if (!min) return 0;
  const diff = Date.now() - min;
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

/**
 * Sección "Conoceme / Sobre mí".
 *
 * Distribución en 2 columnas en pantallas md+:
 * - Columna izquierda: título + biografía (sobre_mi) renderizada por párrafos
 *   + link mailto: con el email de contacto
 * - Columna derecha: tarjetas con estadísticas (años de experiencia, cantidad
 *   de certificaciones/logros, disponibilidad)
 *
 * Animaciones `whileInView` de Framer Motion para entradas al hacer scroll.
 */
export default function About({
  persona,
  experiencias,
  logros,
}: AboutProps) {
  const sobreMi =
    persona?.sobre_mi ??
    'Soy un profesional apasionado por la tecnología con experiencia en desarrollo de software. Me enfoco en entregar soluciones robustas y escalables, manteniendo siempre un alto estándar de calidad y atención al detalle.';
  const email = persona?.email_contacto ?? 'contacto@ejemplo.com';
  const nombre = persona ? `${persona.nombre} ${persona.apellido}` : '';

  const startDates = experiencias.map((e) => e.fecha_inicio);
  const anosExp = calculateYears(startDates);
  const numCertificaciones = logros.length;

  /** Tarjetas de estadísticas que aparecen en la columna derecha. */
  const stats = [
    {
      label: 'Años de experiencia',
      value: `${anosExp}+`,
      icon: FaBriefcase,
      color: 'from-primary-500 to-primary-700',
    },
    {
      label: 'Certificaciones y logros',
      value: `${numCertificaciones}+`,
      icon: FaAward,
      color: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Disponibilidad',
      value: 'Remota',
      icon: FaCalendarAlt,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section id="about" className="bg-white dark:bg-slate-900/50">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Conoceme
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Sobre mí
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {nombre || 'Mi historia'}
            </h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              {sobreMi.split('\n').map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  ✉️ {email}
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4 sm:gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="card text-center sm:text-left"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg mb-4`}
                >
                  <s.icon size={22} />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {s.value}
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
