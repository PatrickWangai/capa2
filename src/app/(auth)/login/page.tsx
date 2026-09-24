import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-[13.5px] text-muted">Log in to your Capa account.</p>
      <div className="mt-7">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-center text-[13.5px] text-muted">
        New to Capa?{" "}
        <Link href="/signup" className="font-medium text-ink underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </div>
  );
}
