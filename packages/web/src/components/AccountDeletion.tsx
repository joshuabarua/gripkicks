'use client'

import React, { useState } from 'react';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

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
      const firstError = validationResult.error.issues[0];
      setValidationError(firstError.message);
      return;
    }
    
    const result = await mutate({
      password: validationResult.data.password,
    });
    
    if (result.isOk()) {
      // Account deleted successfully, redirect to login or home
      setTimeout(() => {
        window.location.href = '/auth/login';
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
    <Card className="max-w-2xl border-destructive/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-6 w-6" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Warning:</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>This will permanently delete your account</li>
              <li>All your profile data will be removed</li>
              <li>Your shoe collection and preferences will be lost</li>
              <li>You will need to create a new account to use the service again</li>
            </ul>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Final Confirmation
                </DialogTitle>
                <DialogDescription>
                  This is the final step. Once you delete your account, there is no going back.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Enter your password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmation">
                    Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="confirmation"
                    name="confirmation"
                    type="text"
                    placeholder="Type DELETE"
                    value={formData.confirmation}
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
                      <p className="font-medium">Account Deleted</p>
                      <p className="mt-1">Redirecting you to the login page...</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      'Permanently Delete Account'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
