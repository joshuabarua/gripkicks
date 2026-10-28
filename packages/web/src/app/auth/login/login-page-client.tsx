"use client";

import { LoginForm } from "@/components/login-form";
import { AuthPageLayout } from "@/components/auth-page-layout";
import { useRedirectIfAuthenticated } from "@/lib/auth";

export default function LoginPageClient() {
  useRedirectIfAuthenticated();
  return (
    <AuthPageLayout title="WELCOME BACK">
      <LoginForm />
    </AuthPageLayout>
  );
}
