import { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Persona, Categoria, Habilidad, Experiencia, Logro } from '../types';
import { apiGet } from '../services/api';
import Navbar from '../sections/Navbar';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Skills from '../sections/Skills';
import Experience from '../sections/Experience';
import Achievements from '../sections/Achievements';
import Footer from '../sections/Footer';

/**
 * Tarjeta individual con efecto de shimmer (pulse) usada en el skeleton.
 * Sirve como placeholder mientras se cargan los datos reales del portfolio.
 */
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

/**
 * Esqueleto completo de la página principal. Se muestra durante la carga inicial.
 * Replica las proporciones generales de Hero + About para evitar layout shift.
 */
function LoadingSkeleton() {
  return (
    <div className="container-page space-y-16">
      <div className="grid md:grid-cols-[auto_1fr] items-center gap-8">
        <SkeletonCard className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full mx-auto md:mx-0" />
        <div className="space-y-4">
          <SkeletonCard className="h-4 w-24" />
          <SkeletonCard className="h-10 w-full" />
          <SkeletonCard className="h-8 w-2/3" />
          <SkeletonCard className="h-20 w-full" />
          <div className="flex gap-3">
            <SkeletonCard className="h-10 w-40" />
            <SkeletonCard className="h-10 w-40" />
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <SkeletonCard className="h-8 w-1/3" />
          <SkeletonCard className="h-24 w-full" />
          <SkeletonCard className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * Página pública principal (`/`) del portfolio.
 *
 * Es el orquestador de alto nivel:
 * 1. Al montarse, dispara 5 peticiones en paralelo a la API pública (persona,
 *    categorías, habilidades, experiencias, logros). Usa `Promise.all` +
 *    `.catch` por endpoint para que el fallo de uno no tumbe el resto.
 * 2. Mientras carga: renderiza Navbar + spinner + `LoadingSkeleton`.
 * 3. Si alguna petición falla: marca `loadError` y muestra un banner
 *    indicando que los datos son placeholders en "modo demo".
 * 4. Renderiza las secciones inyectando los datos por props (HomePage es la
 *    única fuente de fetching; los hijos son componentes presentacionales).
 * 5. Si el componente se desmonta (cancelled=true) evita setState desactualizados.
 */
export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [
          personaRes,
          categoriasRes,
          habilidadesRes,
          experienciasRes,
          logrosRes,
        ] = await Promise.all([
          apiGet<Persona | Persona[]>('/persona').catch(() => null),
          apiGet<Categoria[]>('/categorias').catch(() => [] as Categoria[]),
          apiGet<Habilidad[]>('/habilidades').catch(() => [] as Habilidad[]),
          apiGet<Experiencia[]>('/experiencias').catch(() => [] as Experiencia[]),
          apiGet<Logro[]>('/logros').catch(() => [] as Logro[]),
        ]);

        if (cancelled) return;

        const personaData = Array.isArray(personaRes)
          ? personaRes[0] ?? null
          : personaRes;
        setPersona(personaData);
        setCategorias(Array.isArray(categoriasRes) ? categoriasRes : []);
        setHabilidades(Array.isArray(habilidadesRes) ? habilidadesRes : []);
        setExperiencias(Array.isArray(experienciasRes) ? experienciasRes : []);
        setLogros(Array.isArray(logrosRes) ? logrosRes : []);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <>
        <Navbar persona={null} />
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold">
            <FaSpinner className="animate-spin" /> Cargando portfolio...
          </div>
        </div>
        <LoadingSkeleton />;
        <Footer persona={null} />
      </>
    );
  }

  return (
    <>
      <Navbar persona={persona} />
      {loadError && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Datos mostrando en modo demo.</p>
              <p className="opacity-90">
                No se pudo conectar con la API. Algunos datos pueden ser placeholders.
              </p>
            </div>
          </div>
        </div>
      )}
      <Hero persona={persona} />
      <About
        persona={persona}
        experiencias={experiencias}
        logros={logros}
      />
      <Skills categorias={categorias} habilidades={habilidades} />
      <Experience experiencias={experiencias} />
      <Achievements logros={logros} />
      <Footer persona={persona} />
    </>
  );
}
