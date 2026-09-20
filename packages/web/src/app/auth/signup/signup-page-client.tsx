"use client";

import { SignupForm } from "@/components/signup-form";
import { AuthPageLayout } from "@/components/auth-page-layout";

export default function SignupPageClient() {
  return (
    <AuthPageLayout title="CREATE ACCOUNT">
      <SignupForm />
    </AuthPageLayout>
  );
}
