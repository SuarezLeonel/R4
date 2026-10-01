import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { ToastType } from '../../types';

const toastStyles: Record<ToastType, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  info: 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200',
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
};

const toastIcons: Record<ToastType, JSX.Element> = {
  success: <FaCheckCircle className="text-emerald-500" />,
  error: <FaExclamationCircle className="text-red-500" />,
  info: <FaInfoCircle className="text-sky-500" />,
  warning: <FaExclamationTriangle className="text-amber-500" />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[calc(100%-2rem)] sm:w-96 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border shadow-lg backdrop-blur p-4 ${toastStyles[toast.type]}`}
          >
            <div className="mt-0.5 text-lg flex-shrink-0">{toastIcons[toast.type]}</div>
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition p-1"
              aria-label="Cerrar notificación"
            >
              <FaTimes size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
