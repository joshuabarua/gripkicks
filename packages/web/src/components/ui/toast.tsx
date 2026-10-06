import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AppError } from "@/lib/errors";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface Toast {
  id: string;
  message: string;
  description?: string | undefined;
  type: ToastType;
  duration?: number | undefined;
  action?: {
    label: string;
    onClick: () => void;
  } | undefined;
  onRetry?: (() => void) | undefined;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (message: string, description?: string) => string;
  error: (
    message: string,
    description?: string,
    onRetry?: () => void,
  ) => string;
  warning: (message: string, description?: string) => string;
  info: (message: string, description?: string) => string;
  loading: (message: string, description?: string) => string;
  fromAppError: (error: AppError, onRetry?: () => void) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const duration = toast.duration ?? (toast.type === "loading" ? 0 : 5000);

      setToasts((prev) => {
        const newToasts = [...prev, { ...toast, id, duration }];
        return newToasts.slice(-maxToasts);
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [maxToasts, removeToast],
  );

  const success = useCallback(
    (message: string, description?: string) => {
      return addToast({ type: "success", message, description });
    },
    [addToast],
  );

  const error = useCallback(
    (message: string, description?: string, onRetry?: () => void) => {
      return addToast({
        type: "error",
        message,
        description,
        duration: 7000,
        onRetry,
      });
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string, description?: string) => {
      return addToast({
        type: "warning",
        message,
        description,
        duration: 6000,
      });
    },
    [addToast],
  );

  const info = useCallback(
    (message: string, description?: string) => {
      return addToast({ type: "info", message, description });
    },
    [addToast],
  );

  const loading = useCallback(
    (message: string, description?: string) => {
      return addToast({ type: "loading", message, description, duration: 0 });
    },
    [addToast],
  );

  const fromAppError = useCallback(
    (error: AppError, onRetry?: () => void) => {
      return addToast({
        type: "error",
        message: error.userMessage,
        description:
          error.severity === "high" || error.severity === "critical"
            ? "Please try again or contact support if the problem persists."
            : undefined,
        duration: error.retryable ? 8000 : 6000,
        onRetry: error.retryable ? onRetry : undefined,
      });
    },
    [addToast],
  );

  const promise = useCallback(
    async <T,>(
      promise: Promise<T>,
      messages: { loading: string; success: string; error: string },
    ): Promise<T> => {
      const toastId = loading(messages.loading);

      try {
        const result = await promise;
        removeToast(toastId);
        success(messages.success);
        return result;
      } catch (err) {
        removeToast(toastId);
        const errorMsg = err instanceof Error ? err.message : messages.error;
        error(errorMsg);
        throw err;
      }
    },
    [loading, removeToast, success, error],
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        loading,
        fromAppError,
        promise,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    loading: <Loader2 className="w-5 h-5 text-brand-red animate-spin" />,
  };

  const styles = {
    success: "bg-green-950/90 border-green-500/30",
    error: "bg-red-950/90 border-red-500/30",
    warning: "bg-yellow-950/90 border-yellow-500/30",
    info: "bg-blue-950/90 border-blue-500/30",
    loading: "bg-black/90 border-brand-red/30",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.4 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm shadow-lg ${styles[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-medium text-white">
          {toast.message}
        </p>
        {toast.description && (
          <p className="font-mono text-xs text-neutral-400 mt-1">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <div className="mt-2 flex gap-2">
            {toast.onRetry && (
              <button
                onClick={() => {
                  toast.onRetry?.();
                  onClose();
                }}
                className="text-xs font-mono text-brand-red hover:text-white transition-colors duration-500"
              >
                Retry
              </button>
            )}
            {toast.action &&
              (() => {
                const action = toast.action;
                return (
                  <button
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className="text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {action.label}
                  </button>
                );
              })()}
          </div>
        )}
      </div>

      {toast.type !== "loading" && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
