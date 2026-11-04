'use client'

import React, { useState } from 'react';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { AccountFormStatus } from '@/components/AccountFormStatus';
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
    <div className="lab-card max-w-2xl p-fluid-lg">
      <h3 className="font-amatic text-fluid-3xl text-brand-chalk flex items-center gap-2">
        <Mail className="h-6 w-6" />
        Change Email
      </h3>
      <p className="mt-1 font-mono text-sm text-brand-putty">
        Update your email address. A verification link will be sent to your new email.
      </p>
      <div className="mt-6">
        <div className="space-y-4">
          <div className="p-4 bg-black/40 rounded-lg border border-white/6">
            <Label className="lab-label font-mono">Current Email</Label>
            <p className="text-sm font-semibold text-brand-chalk mt-1">{currentEmail}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label className="lab-label font-mono" htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                placeholder="Enter new email address"
                value={formData.newEmail}
                onChange={handleChange}
                disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
              />
            </div>

            <div className="grid gap-2">
              <Label className="lab-label font-mono" htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password to confirm"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
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
                className="lab-button-ghost"
              >
                Reset
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
