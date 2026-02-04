'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useMutation } from '@/hooks/useAsync';
import { fetchApi } from '@/lib/api-client';
import { useSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Upload, X, User } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
}

export function ProfileImageUpload({ currentImage, onImageUpdate }: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const uploadImage = (file: File) => {
    const userId = session?.user?.id || 'anonymous';
    return fetchApi<{ url: string }>('/api/imagekit/upload', {
      method: 'POST',
      body: JSON.stringify({
        file: file,
        fileName: `profile-${userId}-${Date.now()}`,
        folder: `gripkicks/imgs/user-photos/${userId}`,
      }),
    });
  };

  const { error, isLoading, isSuccess, isError, mutate, reset } = useMutation(uploadImage);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;

    // Convert data URL back to file
    const response = await fetch(preview);
    const blob = await response.blob();
    const file = new File([blob], 'profile-image', { type: blob.type });

    const result = await mutate(file);
    
    if (result.isOk()) {
      onImageUpdate(result.value.url);
      setPreview(null);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Picture</CardTitle>
        <CardDescription>Upload a new profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Image */}
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24">
              {currentImage ? (
                <Image 
                  src={currentImage} 
                  alt="Current profile" 
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Current Picture</p>
              <p className="text-sm text-gray-500">
                {currentImage ? 'Image uploaded' : 'No image uploaded'}
              </p>
            </div>
          </div>

          {/* Upload Area */}
          {!preview && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                Drag and drop your image here, or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                Choose File
              </Button>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-4">
              <div className="relative">
                <Image 
                  src={preview} 
                  alt="Preview" 
                  width={192}
                  height={192}
                  className="h-48 w-48 rounded-lg object-cover mx-auto"
                />
                <button
                  type="button"
                  onClick={handleCancel}
                  className="absolute -top-2 -right-2 rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Picture'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
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
                <p className="font-medium">Success</p>
                <p className="mt-1">Profile picture updated successfully!</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
