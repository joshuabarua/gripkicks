'use client'

import React, { useState } from 'react';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { AccountFormStatus } from '@/components/AccountFormStatus';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordChangeForm() {
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const changePassword = (data: { currentPassword: string; newPassword: string }) =>
    fetchApi<void>('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  const { error, isLoading, isSuccess, isError, mutate, reset } = useMutation(changePassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationResult = passwordSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues.at(0);
      setValidationError(firstError?.message ?? 'Invalid password form');
      return;
    }

    const result = await mutate({
      currentPassword: validationResult.data.currentPassword,
      newPassword: validationResult.data.newPassword,
    });

    if (result.isOk()) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="lab-card max-w-2xl p-fluid-lg">
      <h3 className="lab-title text-fluid-xl text-brand-chalk">Change Password</h3>
      <p className="mt-1 font-mono text-sm text-brand-putty">Update your password to keep your account secure</p>
      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label className="lab-label font-mono" htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-putty/50 hover:text-brand-chalk"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="lab-label font-mono" htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-putty/50 hover:text-brand-chalk"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="lab-label font-mono" htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-putty/50 hover:text-brand-chalk"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AccountFormStatus
            isLoading={isLoading}
            isError={isError}
            isSuccess={isSuccess}
            error={error}
            validationError={validationError}
            successTitle="Success"
            successMessage="Your password has been changed successfully!"
            loadingText="Changing Password..."
            buttonText="Change Password"
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
  );
}
