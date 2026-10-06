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
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {validationError}
        </div>
      )}

      {isError && error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <p className="font-medium">Error</p>
            <p className="mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
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
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white hover:bg-brand-red/90 focus:outline-hidden focus:ring-2 focus:ring-brand-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
