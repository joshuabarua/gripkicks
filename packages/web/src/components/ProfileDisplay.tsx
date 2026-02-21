import React from "react";
import { useProfile } from "@/hooks/useApi";
import { ApiError } from "@/lib/errors";
import { UserAvatar } from "@/components/ui/UserAvatar";

export function ProfileDisplay() {
  const { data: profile, error, isLoading, refetch } = useProfile();

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => refetch()} />;
  }

  if (!profile) {
    return <div>No profile data</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile.name}</h1>
      <p>Email: {profile.email}</p>
      <UserAvatar
        userId={profile.id}
        name={profile.name}
        email={profile.email}
        className="w-16 h-16 rounded-full"
        size={96}
      />
    </div>
  );
}

interface ErrorDisplayProps {
  error: ApiError;
  onRetry: () => void;
}

function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const getErrorMessage = (error: ApiError) => {
    switch (error.type) {
      case "UNAUTHENTICATED":
        return "Please sign in to continue";
      case "UNAUTHORIZED":
        return "You don't have permission to perform this action";
      case "INVALID_DATA":
        return "The data provided is invalid. Please check and try again";
      case "VALIDATION_ERROR":
        return "Invalid request format";
      case "NOT_FOUND":
        return "The requested resource was not found";
      case "NETWORK_ERROR":
        return "Network error. Please check your connection";
      case "TIMEOUT_ERROR":
        return "Request timed out. Please try again";
      case "UNEXPECTED_ERROR":
        return "An unexpected error occurred. Please try again";
      case "RANDOM_ERROR":
        return "A random error occurred (for testing purposes)";
      default:
        return error.message || "An error occurred";
    }
  };

  const getErrorSeverity = (error: ApiError) => {
    switch (error.type) {
      case "UNAUTHENTICATED":
      case "UNAUTHORIZED":
        return "warning";
      case "INVALID_DATA":
      case "VALIDATION_ERROR":
        return "info";
      case "NETWORK_ERROR":
      case "TIMEOUT_ERROR":
        return "warning";
      case "UNEXPECTED_ERROR":
      case "RANDOM_ERROR":
        return "error";
      default:
        return "error";
    }
  };

  const canRetry = [
    "NETWORK_ERROR",
    "TIMEOUT_ERROR",
    "INTERNAL_SERVER_ERROR",
    "UNEXPECTED_ERROR",
    "RANDOM_ERROR",
  ].includes(error.type);

  const severity = getErrorSeverity(error);

  return (
    <div
      className={`p-4 border rounded-lg ${
        severity === "error"
          ? "border-red-300 bg-red-50"
          : severity === "warning"
            ? "border-yellow-300 bg-yellow-50"
            : "border-blue-300 bg-blue-50"
      }`}
    >
      <h3
        className={`font-semibold ${
          severity === "error"
            ? "text-red-800"
            : severity === "warning"
              ? "text-yellow-800"
              : "text-blue-800"
        }`}
      >
        {severity === "error"
          ? "Error"
          : severity === "warning"
            ? "Warning"
            : "Notice"}
      </h3>
      <p
        className={`mt-2 ${
          severity === "error"
            ? "text-red-700"
            : severity === "warning"
              ? "text-yellow-700"
              : "text-blue-700"
        }`}
      >
        {getErrorMessage(error)}
      </p>
      {error.details != null && (
        <details className="mt-2">
          <summary className="text-sm opacity-75 cursor-pointer">
            Details
          </summary>
          <pre className="mt-1 text-xs overflow-auto">
            {typeof error.details === "string"
              ? error.details
              : JSON.stringify(error.details, null, 2)}
          </pre>
        </details>
      )}
      {canRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
