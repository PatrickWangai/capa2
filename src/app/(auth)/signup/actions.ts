"use server";

import { z } from "zod";
import { createUser, EmailTakenError, UsernameTakenError } from "@/services/users";

const schema = z.object({
  name: z.string().min(2, "Enter your full name."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  interests: z.array(z.string()).optional(),
});

export interface RegisterState {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "username" | "email" | "password", string>>;
}

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    interests: formData.getAll("interests"),
  });

  if (!parsed.success) {
    const fieldErrors: RegisterState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<RegisterState["fieldErrors"]>;
      fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  try {
    await createUser(parsed.data);
    return { ok: true };
  } catch (err) {
    if (err instanceof EmailTakenError) return { ok: false, error: err.message, fieldErrors: { email: err.message } };
    if (err instanceof UsernameTakenError) return { ok: false, error: err.message, fieldErrors: { username: err.message } };
    console.error(err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
