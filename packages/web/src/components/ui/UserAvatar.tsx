"use client";

import { useMemo, useState } from "react";
import { getDicebearAvatarUrl, getInitials } from "@/lib/avatar";

type UserAvatarProps = {
  userId?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  alt?: string;
  className?: string;
  size?: number;
};

export function UserAvatar({
  userId,
  name,
  email,
  alt,
  className = "w-10 h-10 rounded-full",
  size = 128,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const avatarIdentity = useMemo(
    () => ({
      ...(userId !== undefined ? { userId } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
    }),
    [userId, name, email],
  );

  const initialsIdentity = useMemo(
    () => ({
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
    }),
    [name, email],
  );

  const avatarUrl = useMemo(
    () => getDicebearAvatarUrl(avatarIdentity, size),
    [avatarIdentity, size],
  );

  if (hasError) {
    return (
      <div
        className={`${className} bg-neutral-900 border border-neutral-800 flex items-center justify-center`}
      >
        <span className="font-mono text-xs text-white/80">
          {getInitials(initialsIdentity)}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt={alt || name || email || "User avatar"}
      className={`${className} object-cover`}
      onError={() => setHasError(true)}
      loading="lazy"
      decoding="async"
    />
  );
}
