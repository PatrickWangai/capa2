import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-2xl font-bold text-ink">Start investing</h1>
      <p className="mt-1.5 text-[13.5px] text-muted">Create your Capa account — takes about a minute.</p>
      <div className="mt-7">
        <SignupForm />
      </div>
      <p className="mt-6 text-center text-[13.5px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
