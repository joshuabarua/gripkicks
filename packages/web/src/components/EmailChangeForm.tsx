'use client'

import React, { useState } from 'react';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { AccountFormStatus } from '@/components/AccountFormStatus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { useFormChange } from '@/hooks/useFormChange';

const emailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type EmailChangeFormData = z.infer<typeof emailChangeSchema>;

interface EmailChangeFormProps {
  currentEmail: string;
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const { formData, setFormData, handleChange } = useFormChange<EmailChangeFormData>({
    newEmail: '',
    password: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const changeEmail = (data: EmailChangeFormData) =>
    fetchApi<void>('/api/v1/auth/change-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  const { error, isLoading, isSuccess, isError, mutate, reset } = useMutation(changeEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationResult = emailChangeSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues.at(0);
      setValidationError(firstError?.message ?? 'Invalid email change form');
      return;
    }

    // Check if new email is the same as current
    if (formData.newEmail === currentEmail) {
      setValidationError('New email must be different from current email');
      return;
    }

    const result = await mutate(validationResult.data);

    if (result.isOk()) {
      setFormData({
        newEmail: '',
        password: '',
      });
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Change Email
        </CardTitle>
        <CardDescription>
          Update your email address. A verification link will be sent to your new email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Email Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-600">Current Email</Label>
            <p className="text-sm font-semibold text-gray-900 mt-1">{currentEmail}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                placeholder="Enter new email address"
                value={formData.newEmail}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password to confirm"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <AccountFormStatus
              isLoading={isLoading}
              isError={isError}
              isSuccess={isSuccess}
              error={error}
              validationError={validationError}
              successTitle="Verification Email Sent"
              successMessage="Please check your new email inbox and click the verification link to complete the change."
              loadingText="Sending Verification..."
              buttonText="Change Email"
            />

            {(isSuccess || isError || validationError) && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setValidationError(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
              >
                Reset
              </button>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
