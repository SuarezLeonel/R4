import { motion } from 'framer-motion';
import { FaAward, FaCalendarAlt, FaUniversity } from 'react-icons/fa';
import { Logro } from '../types';

interface AchievementsProps {
  logros: Logro[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

const placeholderBadge =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=insignia%20certificaci%C3%B3n%20logo%20badge%20dorado%20fondo%20transparente&image_size=square';

export default function Achievements({ logros }: AchievementsProps) {
  return (
    <section id="achievements">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Reconocimientos
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Logros y certificaciones
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full" />
        </motion.div>

        {logros.length === 0 ? (
          <div className="card max-w-xl mx-auto text-center text-slate-500 dark:text-slate-400">
            <FaAward className="mx-auto mb-3 text-primary-500" size={32} />
            <p className="font-medium">Aún no hay logros cargados.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {logros.map((logro, i) => (
              <motion.div
                key={logro.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card flex flex-col items-center text-center"
              >
                <div className="relative mb-5">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 opacity-60 blur-md" />
                  <img
                    src={logro.insignia_url || placeholderBadge}
                    alt={logro.titulo}
                    className="relative w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-white"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = placeholderBadge;
                    }}
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                  {logro.titulo}
                </h3>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1">
                  <FaUniversity size={13} />
                  {logro.institucion_o_entidad}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <FaCalendarAlt />
                  {formatDate(logro.fecha_obtencion)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {logro.descripcion_logro}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
