import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface AccountFormStatusProps {
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  validationError?: string | null;
  successTitle?: string;
  successMessage?: string;
  loadingText?: string;
  buttonText?: string;
}

export function AccountFormStatus({
  isLoading = false,
  isError = false,
  isSuccess = false,
  error = null,
  validationError = null,
  successTitle = "Success",
  successMessage,
  loadingText = "Saving...",
  buttonText = "Save",
}: AccountFormStatusProps) {
  return (
    <>
      {validationError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 font-mono text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {validationError}
        </div>
      )}

      {isError && error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 font-mono text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <div>
            <p className="font-medium">Error</p>
            <p className="mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 font-mono text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <div>
            <p className="font-medium">{successTitle}</p>
            {successMessage && <p className="mt-1">{successMessage}</p>}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="lab-button flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText}
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </>
  );
}
