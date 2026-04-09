import { Suspense } from "react";
import SignupPageClient from "./signup-page-client";

export default function Signup() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <SignupPageClient />
    </Suspense>
  );
}
