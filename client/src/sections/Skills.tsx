import { motion } from 'framer-motion';
import { Categoria, Habilidad } from '../types';

interface SkillsProps {
  categorias: Categoria[];
  habilidades: Habilidad[];
}

export default function Skills({ categorias, habilidades }: SkillsProps) {
  const grouped: Record<number, Habilidad[]> = {};
  habilidades.forEach((h) => {
    if (!grouped[h.categoria_id]) grouped[h.categoria_id] = [];
    grouped[h.categoria_id].push(h);
  });

  const lista = categorias
    .map((c) => ({
      categoria: c,
      items: grouped[c.id] ?? [],
    }))
    .filter((g) => g.items.length > 0);

  if (lista.length === 0 && habilidades.length > 0) {
    lista.push({
      categoria: { id: 0, nombre_categoria: 'Habilidades' },
      items: habilidades,
    });
  }

  return (
    <section id="skills">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Stack tecnológico
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Habilidades
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {lista.map((group, gIdx) => (
            <motion.div
              key={group.categoria.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: gIdx * 0.05 }}
              className="card h-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-md">
                  {group.categoria.nombre_categoria.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {group.categoria.nombre_categoria}
                </h3>
              </div>

              <ul className="space-y-5">
                {group.items.map((h, i) => (
                  <motion.li
                    key={h.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {h.icono_url ? (
                          <img
                            src={h.icono_url}
                            alt=""
                            className="w-5 h-5 flex-shrink-0 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate">
                          {h.nombre}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                        {h.nivel_porcentaje}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${h.nivel_porcentaje}%` }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.9, delay: 0.05 * i, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      />
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
