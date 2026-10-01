import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaEnvelope, FaUser, FaCommentDots, FaSpinner } from 'react-icons/fa';
import { ContactPayload } from '../types';
import { apiPost } from '../services/api';
import { useToast } from '../contexts/ToastContext';

/**
 * Errores posibles en el formulario de contacto.
 * Todas las claves son opcionales; solo se llenan las que fallan.
 */
interface FormErrors {
  nombre?: string;
  email?: string;
  mensaje?: string;
}

/** Expresión regular simple para validar emails tipo usuario@dominio.tld */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulario público de contacto. Valida nombre/email/mensaje y envía los datos
 * al endpoint `/contact` del backend. Muestra mensajes de éxito/error mediante
 * el sistema de toasts (ver `ToastContext`).
 *
 * Incluye:
 * - Validación por campo (onBlur) y total (onSubmit)
 * - Marcadores de campos tocados para no mostrar errores de primeras
 * - Estado de loading con spinner mientras se envía
 * - Limpieza automática del formulario después de envío exitoso
 */
export default function ContactForm() {
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ContactPayload>({
    nombre: '',
    email: '',
    mensaje: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Valida un solo campo del formulario.
   * @param name Campo a validar
   * @param value Valor actual del input
   * @returns Mensaje de error o `undefined` si es válido
   */
  const validateField = (name: keyof ContactPayload, value: string): string | undefined => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        return undefined;
      case 'email':
        if (!value.trim()) return 'El email es requerido';
        if (!EMAIL_REGEX.test(value.trim())) return 'Ingresa un email válido';
        return undefined;
      case 'mensaje':
        if (!value.trim()) return 'El mensaje es requerido';
        if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
        return undefined;
    }
  };

  /**
   * Ejecuta la validación de todos los campos y devuelve un objeto con los errores.
   */
  const validateAll = (): FormErrors => {
    return {
      nombre: validateField('nombre', form.nombre),
      email: validateField('email', form.email),
      mensaje: validateField('mensaje', form.mensaje),
    };
  };

  /**
   * Handler onChange: actualiza el estado del campo y, si el campo ya fue tocado,
   * re-valida para feedback inmediato.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name as keyof ContactPayload, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  /**
   * Handler onBlur: marca el campo como tocado y ejecuta su validación.
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name as keyof ContactPayload, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  /**
   * Submit del formulario: valida todo, marca como tocados los campos,
   * envía al backend y resetea el formulario en caso de éxito.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const allErrors = validateAll();
    setErrors(allErrors);
    setTouched({ nombre: true, email: true, mensaje: true });

    if (Object.values(allErrors).some(Boolean)) {
      pushToast('error', 'Corrige los errores del formulario.');
      return;
    }

    setLoading(true);
    try {
      await apiPost<{ ok: boolean }>('/contact', form);
      pushToast('success', '¡Mensaje enviado! Te responderé a la brevedad.');
      setForm({ nombre: '', email: '', mensaje: '' });
      setTouched({});
      setErrors({});
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Error al enviar el mensaje.')
          : 'Error al enviar el mensaje.';
      pushToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  /** Devuelve las clases CSS de un input (base + clase de error si corresponde). */
  const inputClass = (field: keyof FormErrors) =>
    `input-base ${errors[field] && touched[field] ? 'border-red-500 focus:ring-red-500' : ''}`;

  return (
    <section id="contact">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">
            Contáctame
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Hablemos de tu proyecto
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mb-4" />
          <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Tienes un proyecto en mente, una propuesta de colaboración o simplemente quieres saludar?
            Completa el formulario y me pondré en contacto contigo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_1.3fr] gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="card flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md flex-shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Email</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Responderé en menos de 24 horas hábiles.
                </p>
              </div>
            </div>

            <div className="card flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500 to-pink-600 text-white shadow-md flex-shrink-0">
                <FaCommentDots />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  ¿Qué puedes enviar?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Propuestas freelance, colaboración en proyectos, ofertas laborales o networking.
                </p>
              </div>
            </div>

            <div className="card flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md flex-shrink-0">
                <FaPaperPlane />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Proceso</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Recepción → Revisión → Respuesta personalizada → Reunión o alcances.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            noValidate
            className="card"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="nombre" className="label-base">
                  <span className="inline-flex items-center gap-1.5">
                    <FaUser size={12} className="text-primary-500" /> Nombre completo
                  </span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre"
                  className={inputClass('nombre')}
                />
                {errors.nombre && touched.nombre && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="label-base">
                  <span className="inline-flex items-center gap-1.5">
                    <FaEnvelope size={12} className="text-primary-500" /> Email
                  </span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="tu@email.com"
                  className={inputClass('email')}
                />
                {errors.email && touched.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="mensaje" className="label-base">
                <span className="inline-flex items-center gap-1.5">
                  <FaCommentDots size={12} className="text-primary-500" /> Mensaje
                </span>
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={6}
                value={form.mensaje}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Cuéntame sobre tu proyecto o idea..."
                className={`${inputClass('mensaje')} resize-y`}
              />
              <div className="flex justify-between mt-1.5 gap-2">
                {errors.mensaje && touched.mensaje ? (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {errors.mensaje}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {form.mensaje.length} caracteres
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={14} />
                  Enviando...
                </>
              ) : (
                <>
                  <FaPaperPlane size={14} />
                  Enviar mensaje
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

