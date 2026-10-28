"use client";

import { SignupForm } from "@/components/signup-form";
import { AuthPageLayout } from "@/components/auth-page-layout";
import { useRedirectIfAuthenticated } from "@/lib/auth";

export default function SignupPageClient() {
  useRedirectIfAuthenticated();
  return (
    <AuthPageLayout title="CREATE ACCOUNT">
      <SignupForm />
    </AuthPageLayout>
  );
}
