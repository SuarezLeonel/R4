import { motion } from 'framer-motion';
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

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {nombre || 'Mi historia'}
            </h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base text-left">
              {sobreMi.split('\n').map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
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
        </div>
      </div>
    </section>
  );
}
