import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const SANDBOX_STARTING_CASH = "100000"; // KES — this app is a sandbox until a real broker/payment provider is wired in.

export class EmailTakenError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "EmailTakenError";
  }
}

export class UsernameTakenError extends Error {
  constructor() {
    super("That username is already taken.");
    this.name = "UsernameTakenError";
  }
}

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  name: string;
  interests?: string[];
}

function generateAccountNumber(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `CAPA-${digits}`;
}

export async function createUser(input: CreateUserInput) {
  const email = input.email.toLowerCase().trim();
  const username = input.username.toLowerCase().trim();

  const [existingEmail, existingUsername] = await Promise.all([
    db.user.findUnique({ where: { email } }),
    db.user.findUnique({ where: { username } }),
  ]);
  if (existingEmail) throw new EmailTakenError();
  if (existingUsername) throw new UsernameTakenError();

  const passwordHash = await bcrypt.hash(input.password, 10);

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, username, passwordHash, name: input.name },
    });
    await tx.profile.create({
      data: { userId: user.id, interests: input.interests ?? [] },
    });
    await tx.account.create({
      data: { userId: user.id, accountNumber: generateAccountNumber() },
    });
    await tx.wallet.create({
      data: { userId: user.id, cashBalance: SANDBOX_STARTING_CASH },
    });
    return user;
  });
}
