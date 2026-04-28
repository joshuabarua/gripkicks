"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useAsync } from "@/hooks/useAsync";
import { fetchApi } from "@/lib/api-client";
import { ApiError } from "@/lib/errors";
import { ResultAsync } from "neverthrow";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
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
  email?: string;
  userId?: string;
  onProfileUpdated?: (profile: ProfileData) => void;
  onSuccess?: () => void;
}

export function ProfileForm({
  initialProfile,
  email,
  userId,
  onProfileUpdated,
  onSuccess,
}: ProfileFormProps) {
  const { formData, setFormData, handleChange } = useFormChange<ProfileData>({
    name: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const profileLoader = useAsync<ProfileData>();
  const { execute: loadProfileData } = profileLoader;

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        name: initialProfile.name || "",
      });
      return;
    }

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
  }, [initialProfile, loadProfileData]);

  const updateProfile = (data: ProfileData): ResultAsync<ProfileData, ApiError> =>
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
      (error) => error as ApiError,
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
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <UserAvatar
            userId={userId}
            name={formData.name}
            email={email}
            className="h-16 w-16 rounded-full"
            size={96}
          />
          <div>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>
              Update your profile information. Avatar is generated
              automatically.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {profileLoader.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {validationError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationError}
              </div>
            )}

            {isError && error && (
              <div
                className={`flex items-center gap-2 rounded-md p-3 text-sm ${getErrorSeverity(error) === "error"
                    ? "bg-destructive/10 text-destructive"
                    : getErrorSeverity(error) === "warning"
                      ? "bg-yellow-50 text-yellow-800"
                      : "bg-blue-50 text-blue-800"
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
              <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <div>
                  <p className="font-medium">Success</p>
                  <p className="mt-1">Profile updated successfully!</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>

              {(isSuccess || isError || validationError) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setValidationError(null);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function getErrorDisplayMessage(error: ApiError): string {
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

function getErrorSeverity(error: ApiError): "error" | "warning" | "info" {
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
