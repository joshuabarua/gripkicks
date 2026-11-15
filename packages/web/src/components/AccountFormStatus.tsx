import { Loader2 } from "lucide-react";
import { StatusMessage } from "@/components/ui/status-message";

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
        <StatusMessage tone="danger">{validationError}</StatusMessage>
      )}

      {isError && error && (
        <StatusMessage tone="danger" title="Error">{error.message}</StatusMessage>
      )}

      {isSuccess && (
        <StatusMessage tone="success" title={successTitle}>{successMessage}</StatusMessage>
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
