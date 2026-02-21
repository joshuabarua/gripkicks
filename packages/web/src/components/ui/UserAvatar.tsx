"use client";

import { useMemo, useState } from "react";
import { getDicebearAvatarUrl, getInitials } from "@/lib/avatar";

type UserAvatarProps = {
  userId?: string | null;
  name?: string | null;
  email?: string | null;
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

  const avatarUrl = useMemo(
    () => getDicebearAvatarUrl({ userId, name, email }, size),
    [userId, name, email, size],
  );

  if (hasError) {
    return (
      <div
        className={`${className} bg-neutral-900 border border-neutral-800 flex items-center justify-center`}
      >
        <span className="font-sora text-xs text-white/80">
          {getInitials({ name, email })}
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
