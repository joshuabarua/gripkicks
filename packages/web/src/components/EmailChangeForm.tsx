'use client'

import React, { useState } from 'react';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { ApiError } from '@/lib/errors';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

const emailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type EmailChangeFormData = z.infer<typeof emailChangeSchema>;

interface EmailChangeFormProps {
  currentEmail: string;
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const [formData, setFormData] = useState<EmailChangeFormData>({
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
      const firstError = validationResult.error.issues[0];
      setValidationError(firstError.message);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                  <p className="font-medium">Verification Email Sent</p>
                  <p className="mt-1">
                    Please check your new email inbox and click the verification link to complete the change.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Verification...
                  </>
                ) : (
                  'Change Email'
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
        </div>
      </CardContent>
    </Card>
  );
}
