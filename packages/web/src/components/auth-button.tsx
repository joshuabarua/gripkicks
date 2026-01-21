'use client';

import Link from 'next/link';
import { Button } from './ui/button';

export default function AuthButton() {
  return (
    <Link href="/auth/login">
      <Button size="sm">
        Sign In
      </Button>
    </Link>
  );
}
