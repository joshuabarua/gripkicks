import { Suspense } from "react";
import LoginPageClient from "./login-page-client";

export default function Login() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <LoginPageClient />
    </Suspense>
  );
}
