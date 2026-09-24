"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { registerAction, type RegisterState } from "./actions";

const INTERESTS = ["Kenya", "US", "Global", "ETFs", "Dividends", "Growth"];

const initialState: RegisterState = { ok: false };

export function SignupForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const hasHandledSuccess = useRef(false);

  useEffect(() => {
    if (!state.ok || hasHandledSuccess.current) return;
    hasHandledSuccess.current = true;
    setIsLoggingIn(true);

    const form = document.getElementById("signup-form") as HTMLFormElement;
    const email = (form?.elements.namedItem("email") as HTMLInputElement)?.value;
    const password = (form?.elements.namedItem("password") as HTMLInputElement)?.value;

    void (async () => {
      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
      router.refresh();
    })();
  }, [state.ok, router]);

  return (
    <form id="signup-form" action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" className="mt-1.5" />
        <FieldError>{state.fieldErrors?.name}</FieldError>
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" placeholder="patrick" className="mt-1.5" />
        <FieldError>{state.fieldErrors?.username}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
        <FieldError>{state.fieldErrors?.email}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" className="mt-1.5" />
        <FieldError>{state.fieldErrors?.password}</FieldError>
      </div>

      <div>
        <Label>What are you interested in?</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const active = selected.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() =>
                  setSelected((prev) => (active ? prev.filter((i) => i !== interest) : [...prev, interest]))
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  active ? "border-ink bg-ink text-paper" : "border-line-strong text-ink-soft hover:bg-surface-raised",
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>
        {selected.map((i) => (
          <input key={i} type="hidden" name="interests" value={i} />
        ))}
      </div>

      {state.error && <p className="text-[13px] text-loss">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={isPending || isLoggingIn}>
        {isPending || isLoggingIn ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-[12px] text-faint">
        This is a sandbox environment — no real money is deposited or traded.
      </p>
    </form>
  );
}
