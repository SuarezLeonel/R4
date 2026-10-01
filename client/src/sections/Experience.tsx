import { motion } from 'framer-motion';
import { FaBriefcase, FaCalendarAlt } from 'react-icons/fa';
import { Experiencia } from '../types';

interface ExperienceProps {
  experiencias: Experiencia[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
}

export default function Experience({ experiencias }: ExperienceProps) {
  const sorted = [...experiencias].sort((a, b) => {
    const ta = new Date(a.fecha_inicio).getTime() || 0;
    const tb = new Date(b.fecha_inicio).getTime() || 0;
    return tb - ta;
  });

  return (
    <section id="experience" className="bg-white dark:bg-slate-900/50">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="mb-14 text-center"
        >
          <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Trayectoria
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Experiencia
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full" />
        </motion.div>

        {sorted.length === 0 ? (
          <div className="card max-w-xl mx-auto text-center text-slate-500 dark:text-slate-400">
            <FaBriefcase className="mx-auto mb-3 text-primary-500" size={32} />
            <p className="font-medium">Aún no hay experiencias cargadas.</p>
          </div>
        ) : (
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 via-primary-500/50 to-transparent -translate-x-1/2 md:-translate-x-1/2" />

            <ul className="space-y-10">
              {sorted.map((exp, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <motion.li
                    key={exp.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="relative"
                  >
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 border-4 border-white dark:border-slate-900/50 shadow-md" />
                    </div>

                    <div className={`ml-12 md:ml-0 md:grid md:grid-cols-2 md:gap-10`}>
                      <div
                        className={`${
                          isLeft ? 'md:order-1 md:text-right md:pr-12' : 'md:order-2 md:col-start-2 md:pl-12'
                        } mb-3 md:mb-0 flex md:block items-center gap-2`}
                      >
                        <FaCalendarAlt
                          size={14}
                          className="text-primary-500 md:mb-2 md:hidden"
                        />
                        <FaCalendarAlt
                          size={16}
                          className="text-primary-500 md:mb-2 hidden md:inline-block"
                        />
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                          {formatDate(exp.fecha_inicio)} —{' '}
                          {exp.es_actual ? 'Actualidad' : formatDate(exp.fecha_fin)}
                        </span>
                        {exp.es_actual && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> En curso
                          </span>
                        )}
                      </div>

                      <div
                        className={`${
                          isLeft ? 'md:order-2 md:pl-12' : 'md:order-1 md:row-start-1 md:text-right md:pr-12'
                        }`}
                      >
                        <div className="card">
                          <div
                            className={`flex md:block items-start gap-3 ${
                              !isLeft ? 'md:flex md:flex-row-reverse md:text-right' : ''
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-600/15 text-primary-600 dark:text-primary-400 flex-shrink-0 md:mb-3 md:inline-flex">
                              <FaBriefcase size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                                {exp.puesto}
                              </h3>
                              <p className="font-semibold text-sm text-primary-600 dark:text-primary-400 mb-3">
                                {exp.empresa}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {exp.descripcion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
