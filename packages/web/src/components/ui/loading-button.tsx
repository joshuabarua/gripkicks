"use client";

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { motion } from 'framer-motion';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={`relative transition-all duration-200 ${className}`}
      {...props}
    >
      <motion.div
        className="flex items-center gap-2"
        animate={isLoading ? { opacity: [1, 0.7, 1] } : {}}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
      >
        {isLoading && (
          <LoadingSpinner size="sm" />
        )}
        <span className={isLoading ? 'opacity-70' : ''}>
          {isLoading ? loadingText : children}
        </span>
      </motion.div>
    </Button>
  );
}

// Specialized loading buttons for common actions
export function AddToStashButton({
  isLoading,
  isInStash,
  onClick
}: {
  isLoading?: boolean;
  isInStash?: boolean;
  onClick?: () => void;
}) {
  const loadingProps = {
    ...(isLoading !== undefined ? { isLoading } : {}),
    ...(onClick ? { onClick } : {}),
  };

  return (
    <LoadingButton
      {...loadingProps}
      loadingText={isInStash ? 'Removing...' : 'Adding...'}
      variant={isInStash ? 'destructive' : 'default'}
      size="sm"
      className="w-full"
    >
      {isInStash ? 'Remove from Stash' : 'Add to Stash'}
    </LoadingButton>
  );
}

export function SaveButton({
  isLoading,
  onClick,
  disabled
}: {
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const loadingProps = {
    ...(isLoading !== undefined ? { isLoading } : {}),
    ...(onClick ? { onClick } : {}),
    ...(disabled !== undefined ? { disabled } : {}),
  };

  return (
    <LoadingButton
      {...loadingProps}
      loadingText="Saving..."
      variant="default"
      size="sm"
    >
      Save
    </LoadingButton>
  );
}

export function DeleteButton({
  isLoading,
  onClick,
  confirmMode = false
}: {
  isLoading?: boolean;
  onClick?: () => void;
  confirmMode?: boolean;
}) {
  const loadingProps = {
    ...(isLoading !== undefined ? { isLoading } : {}),
    ...(onClick ? { onClick } : {}),
  };

  return (
    <LoadingButton
      {...loadingProps}
      loadingText="Deleting..."
      variant={confirmMode ? 'destructive' : 'ghost'}
      size="sm"
    >
      {confirmMode ? 'Confirm Delete' : 'Delete'}
    </LoadingButton>
  );
}

export function UploadButton({
  isLoading,
  onClick,
  disabled
}: {
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const loadingProps = {
    ...(isLoading !== undefined ? { isLoading } : {}),
    ...(onClick ? { onClick } : {}),
    ...(disabled !== undefined ? { disabled } : {}),
  };

  return (
    <LoadingButton
      {...loadingProps}
      loadingText="Uploading..."
      variant="outline"
      size="sm"
    >
      Upload
    </LoadingButton>
  );
}
