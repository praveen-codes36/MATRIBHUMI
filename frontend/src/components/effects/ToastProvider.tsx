/**
 * Effect #4 & #10: Global ToastProvider with shrinking timer and pause-on-hover
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../../types/nlams';

interface ToastContextType {
  push: (severity: ToastMessage['severity'], title: string, message?: string, durationMs?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  key?: string | number;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.durationMs || 5000;
  const [remainingTime, setRemainingTime] = useState(duration);
  const dismissedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - 50));
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (remainingTime <= 0) {
      handleDismiss();
    }
  }, [remainingTime, handleDismiss]);

  const severityStyles = {
    success: {
      border: 'border-l-4 border-l-[#16a34a]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />,
      bar: 'bg-[#16a34a]',
    },
    warning: {
      border: 'border-l-4 border-l-[#d97706]',
      icon: <AlertTriangle className="w-5 h-5 text-[#d97706] shrink-0" />,
      bar: 'bg-[#d97706]',
    },
    danger: {
      border: 'border-l-4 border-l-[#dc2626]',
      icon: <AlertCircle className="w-5 h-5 text-[#dc2626] shrink-0" />,
      bar: 'bg-[#dc2626]',
    },
    info: {
      border: 'border-l-4 border-l-[#2563eb]',
      icon: <Info className="w-5 h-5 text-[#2563eb] shrink-0" />,
      bar: 'bg-[#2563eb]',
    },
  }[toast.severity];

  const progressPercent = Math.max(0, Math.min(100, (remainingTime / duration) * 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-88 max-w-[calc(100vw-32px)] bg-white rounded-lg shadow-xl shadow-black/5 overflow-hidden border border-slate-200/80 pointer-events-auto ${severityStyles.border}`}
      role="alert"
    >
      <div className="p-3.5 flex items-start gap-3">
        {severityStyles.icon}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold text-[#1c2530] leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-[11px] text-[#64748b] mt-0.5 leading-normal">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded hover:bg-slate-100"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Shrinking progress bar */}
      <div className="w-full h-1 bg-slate-100 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${severityStyles.bar}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback(
    (severity: ToastMessage['severity'], title: string, message = '', durationMs = 5000) => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        severity,
        title,
        message,
        timestamp: Date.now(),
        durationMs,
      };
      setToasts((prev) => [newToast, ...prev].slice(0, 5));
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      {/* Top-Right Container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
