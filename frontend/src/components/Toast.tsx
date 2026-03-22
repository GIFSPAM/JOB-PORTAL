import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { XCircle, CheckCircle, X } from 'lucide-react';

type ToastType = 'error' | 'success';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const TOAST_DURATION_MS = 4500;

export interface ToastContextValue {
  error: (msg: string) => void;
  success: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), TOAST_DURATION_MS);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      error: (msg) => add(msg, 'error'),
      success: (msg) => add(msg, 'success'),
    }),
    [add],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.92 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 min-w-72 max-w-sm px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-2xl ${
                t.type === 'error'
                  ? 'bg-red-950/80 border-red-500/25 text-red-300'
                  : 'bg-green-950/80 border-green-500/25 text-green-300'
              }`}
            >
              {t.type === 'error' ? (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span className="text-sm font-medium leading-snug flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
