"use client";

import { LoginForm } from "@/components/login-form";
import { AuthPageLayout } from "@/components/auth-page-layout";

export default function LoginPageClient() {
  return (
    <AuthPageLayout
      subtitle="Authenticate"
      title="WELCOME"
      highlightedText="BACK"
    >
      <LoginForm />
    </AuthPageLayout>
  );
}
