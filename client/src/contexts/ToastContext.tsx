import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../types';

interface ToastContextValue {
  toasts: Toast[];
  pushToast: (type: ToastType, message: string) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const to = timeoutsRef.current.get(id);
    if (to) {
      clearTimeout(to);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextIdRef.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      const to = setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);
      timeoutsRef.current.set(id, to);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, pushToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx === undefined) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return ctx;
}
