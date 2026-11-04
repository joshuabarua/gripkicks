'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { AccountFormStatus } from './AccountFormStatus';

const deletionSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z
    .string()
    .transform((value) => value.toUpperCase())
    .refine((value) => value === 'DELETE', { message: 'Please type DELETE to confirm' }),
});

type DeletionFormData = {
  password: string;
  confirmation: string;
};

export function AccountDeletion() {
  const router = useRouter();
  const [formData, setFormData] = useState<DeletionFormData>({
    password: '',
    confirmation: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteAccount = (data: { password: string }) =>
    fetchApi<void>('/api/v1/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });

  const { error, isLoading, isSuccess, isError, mutate, reset } = useMutation(deleteAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationResult = deletionSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues.at(0);
      setValidationError(firstError?.message ?? 'Invalid account deletion form');
      return;
    }

    const result = await mutate({
      password: validationResult.data.password,
    });

    if (result.isOk()) {
      setTimeout(() => {
        router.push('/auth/login', { transitionTypes: ['page-nav'] });
      }, 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      reset();
      setValidationError(null);
      setFormData({ password: '', confirmation: '' });
    }
  };

  return (
    <div className="lab-card max-w-2xl border-red-500/20 p-fluid-lg">
      <h3 className="font-ball-pill text-fluid-3xl text-brand-chalk flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        Delete Account
      </h3>
      <p className="mt-1 font-mono text-sm text-brand-putty">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <div className="mt-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
            <h4 className="font-semibold text-red-400 mb-2 font-mono">Warning:</h4>
            <ul className="text-sm text-red-300/80 space-y-1 list-disc list-inside font-mono">
              <li>This will permanently delete your account</li>
              <li>All your profile data will be removed</li>
              <li>Your shoe collection and preferences will be lost</li>
              <li>You will need to create a new account to use the service again</li>
            </ul>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <button type="button" className="lab-button w-full bg-red-500 hover:bg-red-500/80">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-brand-chalk">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Final Confirmation
                </DialogTitle>
                <DialogDescription>
                  This is the final step. Once you delete your account, there is no going back.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label className="lab-label font-mono" htmlFor="password">Enter your password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="lab-label font-mono" htmlFor="confirmation">
                    Type <span className="font-mono bg-white/10 px-1 rounded">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="confirmation"
                    name="confirmation"
                    type="text"
                    placeholder="Type DELETE"
                    value={formData.confirmation}
                    onChange={handleChange}
                    disabled={isLoading}
                className="rounded-lg bg-black border border-white/6 text-brand-chalk placeholder:text-brand-putty/30 h-12 focus:border-brand-red focus:ring-brand-red"
                  />
                </div>

                <div className="space-y-4">
                  <AccountFormStatus
                    isLoading={isLoading}
                    isError={isError}
                    isSuccess={isSuccess}
                    error={error}
                    validationError={validationError}
                    successTitle="Account Deleted"
                    successMessage="Redirecting you to the login page..."
                    loadingText="Deleting Account..."
                    buttonText="Permanently Delete Account"
                  />
                </div>

                <button
                  type="button"
                  className="lab-button-ghost"
                  onClick={() => handleDialogClose(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
