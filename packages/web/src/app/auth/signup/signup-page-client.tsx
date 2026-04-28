"use client";

import { SignupForm } from "@/components/signup-form";
import { AuthPageLayout } from "@/components/auth-page-layout";

export default function SignupPageClient() {
  return (
    <AuthPageLayout
      subtitle="Create account"
      title="JOIN THE"
      highlightedText="CREW"
    >
      <SignupForm />
    </AuthPageLayout>
  );
}
