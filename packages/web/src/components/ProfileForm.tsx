"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useAsync } from "@/hooks/useAsync";
import { fetchApi } from "@/lib/api-client";
import { AppError } from "@/lib/errors";
import { ResultAsync } from "neverthrow";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useFormChange } from "@/hooks/useFormChange";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

type ProfileData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialProfile?: ProfileData | null;
  onProfileUpdated?: (profile: ProfileData) => void;
  onSuccess?: () => void;
}

export function ProfileForm({
  initialProfile,
  onProfileUpdated,
  onSuccess,
}: ProfileFormProps) {
  const initialProfileName = initialProfile?.name ?? null;
  const { formData, setFormData, handleChange } = useFormChange<ProfileData>({
    name: initialProfileName ?? "",
  });
  const [appliedInitialProfileName, setAppliedInitialProfileName] = useState(initialProfileName);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (initialProfileName !== null && initialProfileName !== appliedInitialProfileName) {
    setAppliedInitialProfileName(initialProfileName);
    setFormData({ name: initialProfileName });
  }

  const profileLoader = useAsync<ProfileData>();
  const { execute: loadProfileData } = profileLoader;

  useEffect(() => {
    if (initialProfile) return;

    const loadProfile = async () => {
      const result = await loadProfileData(() =>
        fetchApi<ProfileData>("/api/v1/profile"),
      );

      if (result.isOk()) {
        const profileData = result.value;
        setFormData({
          name: profileData.name || "",
        });
      }
    };

    loadProfile();
  }, [initialProfile, loadProfileData, setFormData]);

  const updateProfile = (data: ProfileData): ResultAsync<ProfileData, AppError> =>
    ResultAsync.fromPromise(
      fetchApi<{ name?: string }>("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((resultAsync) =>
        resultAsync.match(
          (value) => ({
            name: value.name || data.name,
          }),
          (error) => {
            throw error;
          },
        ),
      ),
      (error) => error as AppError,
    );

  const { error, isLoading, isSuccess, isError, mutate, reset } =
    useMutation(updateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationResult = profileSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues.at(0);
      setValidationError(firstError?.message ?? "Invalid profile form");
      return;
    }

    const result = await mutate(validationResult.data);

    if (result.isOk()) {
      const updatedProfile = result.value;
      setFormData(updatedProfile);
      onProfileUpdated?.(updatedProfile);
      onSuccess?.();
    }
  };

  return (
    <div className="lab-card max-w-2xl p-fluid-lg">
      <h3 className="font-ball-pill text-fluid-3xl text-brand-chalk">Profile Settings</h3>
      <p className="mt-1 font-mono text-sm text-brand-putty">Update your profile information.</p>
      <div className="mt-6">
        {profileLoader.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label className="lab-label font-mono" htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
              />
            </div>

            {validationError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 font-mono text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {validationError}
              </div>
            )}

            {isError && error && (
              <div
                className={`flex items-center gap-2 rounded-lg border p-3 font-mono text-sm ${getErrorSeverity(error) === "error"
                    ? "border-red-500/20 bg-red-500/10 text-red-400"
                    : getErrorSeverity(error) === "warning"
                      ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                      : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                  }`}
              >
                <AlertCircle className="h-4 w-4" />
                <div>
                  <p className="font-medium">
                    {getErrorSeverity(error) === "error"
                      ? "Error"
                      : getErrorSeverity(error) === "warning"
                        ? "Warning"
                        : "Notice"}
                  </p>
                  <p className="mt-1">{getErrorDisplayMessage(error)}</p>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 font-mono text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <div>
                  <p className="font-medium">Success</p>
                  <p className="mt-1">Profile updated successfully!</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isLoading} className="lab-button flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>

              {(isSuccess || isError || validationError) && (
                <button
                  type="button"
                  className="lab-button-ghost"
                  onClick={() => {
                    reset();
                    setValidationError(null);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function getErrorDisplayMessage(error: AppError): string {
  switch (error.type) {
    case "UNAUTHENTICATED":
      return "Please sign in to update your profile";
    case "UNAUTHORIZED":
      return "You don't have permission to update this profile";
    case "INVALID_DATA":
      return "Please check your input data for errors (e.g., long name or invalid formatting)";
    case "VALIDATION_ERROR":
      return "Please fill in at least one field to update";
    case "NETWORK_ERROR":
      return "Network error. Please check your connection and try again";
    case "TIMEOUT_ERROR":
      return "Request timed out. Please try again";
    case "UNEXPECTED_ERROR":
      return "An unexpected error occurred. Please try again";
    case "RANDOM_ERROR":
      return "A random error occurred (this is for testing purposes)";
    default:
      return error.message || "An error occurred while updating your profile.";
  }
}

function getErrorSeverity(error: AppError): "error" | "warning" | "info" {
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
}
