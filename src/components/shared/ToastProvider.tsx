"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Toast, type ToastTone } from "@/components/ui/Toast";

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  showToast: (tone: ToastTone, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (tone: ToastTone, message: string) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, tone, message }]);
      setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} tone={toast.tone} onDismiss={() => dismissToast(toast.id)}>
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Toda ação importante do fluxo (Context.md §11.1/§11.5) usa este hook para dar feedback
// consistente, em vez de cada feature reimplementar sua própria notificação.
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return context;
}
