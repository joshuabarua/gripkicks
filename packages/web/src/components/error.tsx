"use client";

import React, { Component, ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from "lucide-react";
import { AppError, ErrorFactory } from "@/lib/errors";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: prev.errorCount + 1,
    }));
    this.props.onRetry?.();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleGoBack = () => {
    window.history.back();
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const appError =
        this.state.error instanceof AppError
          ? this.state.error
          : ErrorFactory.fromUnknown(this.state.error);

      return (
        <ErrorFallback
          error={appError}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onGoBack={this.handleGoBack}
          errorCount={this.state.errorCount}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: AppError;
  onRetry: () => void;
  onGoHome: () => void;
  onGoBack: () => void;
  errorCount: number;
}

function ErrorFallback({
  error,
  onRetry,
  onGoHome,
  onGoBack,
  errorCount,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  const severityColors = {
    low: "border-blue-500/30 bg-blue-500/5",
    medium: "border-yellow-500/30 bg-yellow-500/5",
    high: "border-orange-500/30 bg-orange-500/5",
    critical: "border-red-500/30 bg-red-500/5",
  };

  const severityIcons = {
    low: AlertTriangle,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: AlertTriangle,
  };

  const Icon = severityIcons[error.severity];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div
          className={`border rounded-3xl p-8 ${severityColors[error.severity]}`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {error.code}
              </p>
              <h2 className="font-tanker text-2xl">SOMETHING WENT WRONG</h2>
            </div>
          </div>

          <p className="font-sora text-neutral-400 mb-8 leading-relaxed">
            {error.userMessage}
          </p>

          <div className="space-y-3 mb-6">
            {error.retryable && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                TRY AGAIN
              </motion.button>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoBack}
                className="flex-1 border border-neutral-700 hover:border-orange-500/30 text-neutral-400 hover:text-white font-sora text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoHome}
                className="flex-1 border border-neutral-700 hover:border-orange-500/30 text-neutral-400 hover:text-white font-sora text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </motion.button>
            </div>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="border-t border-neutral-800 pt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors text-sm font-mono"
              >
                <Bug className="w-4 h-4" />
                {showDetails ? "Hide" : "Show"} technical details
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-black/50 rounded-xl font-mono text-xs text-neutral-400 space-y-2 overflow-auto max-h-40">
                      <div>
                        <span className="text-neutral-500">Error:</span>{" "}
                        {error.message}
                      </div>
                      <div>
                        <span className="text-neutral-500">Category:</span>{" "}
                        {error.category}
                      </div>
                      <div>
                        <span className="text-neutral-500">Severity:</span>{" "}
                        {error.severity}
                      </div>
                      <div>
                        <span className="text-neutral-500">Retryable:</span>{" "}
                        {error.retryable.toString()}
                      </div>
                      {error.context && (
                        <div>
                          <span className="text-neutral-500">Context:</span>{" "}
                          {JSON.stringify(error.context, null, 2)}
                        </div>
                      )}
                      {errorCount > 1 && (
                        <div className="text-yellow-500">
                          This error has occurred {errorCount} times
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ErrorBoundary;

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
