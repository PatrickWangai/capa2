import Decimal from "decimal.js";
import { db } from "@/lib/db";
import { PaymentMethod, TransactionType } from "@/generated/prisma/client";

export interface DepositResult {
  id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: Decimal;
  method: PaymentMethod;
}

export interface WithdrawalResult {
  id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: Decimal;
  method: PaymentMethod;
}

/**
 * Abstraction over cash movement. Wallet UI only calls this interface —
 * M-Pesa/bank/card integrations become RealPaymentProvider later without
 * touching wallet pages or the Wallet/Transaction schema.
 */
export interface PaymentProvider {
  createDeposit(userId: string, amount: Decimal.Value, method: PaymentMethod): Promise<DepositResult>;
  getDepositStatus(depositId: string): Promise<DepositResult>;
  createWithdrawal(userId: string, amount: Decimal.Value, method: PaymentMethod): Promise<WithdrawalResult>;
  getWithdrawalStatus(withdrawalId: string): Promise<WithdrawalResult>;
}

/** Simulates instant confirmation, matching how M-Pesa STK push feels in the happy path. */
export class MockPaymentProvider implements PaymentProvider {
  async createDeposit(userId: string, amount: Decimal.Value, method: PaymentMethod): Promise<DepositResult> {
    const amt = new Decimal(amount);
    const wallet = await db.wallet.findUniqueOrThrow({ where: { userId } });
    const deposit = await db.$transaction(async (tx) => {
      const d = await tx.deposit.create({
        data: { walletId: wallet.id, amount: amt.toString(), method, status: "COMPLETED", providerRef: `MOCK-${Date.now()}` },
      });
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { cashBalance: new Decimal(wallet.cashBalance.toString()).plus(amt).toString() },
      });
      await tx.transaction.create({
        data: { walletId: wallet.id, type: TransactionType.DEPOSIT, amount: amt.toString(), description: `${method} deposit` },
      });
      return d;
    });
    return { id: deposit.id, status: "COMPLETED", amount: amt, method };
  }

  async getDepositStatus(depositId: string): Promise<DepositResult> {
    const deposit = await db.deposit.findUniqueOrThrow({ where: { id: depositId } });
    return { id: deposit.id, status: deposit.status, amount: new Decimal(deposit.amount.toString()), method: deposit.method };
  }

  async createWithdrawal(userId: string, amount: Decimal.Value, method: PaymentMethod): Promise<WithdrawalResult> {
    const amt = new Decimal(amount);
    const wallet = await db.wallet.findUniqueOrThrow({ where: { userId } });
    const cash = new Decimal(wallet.cashBalance.toString());
    if (cash.lt(amt)) throw new Error("Insufficient wallet balance for withdrawal.");

    const withdrawal = await db.$transaction(async (tx) => {
      const w = await tx.withdrawal.create({
        data: { walletId: wallet.id, amount: amt.toString(), method, status: "COMPLETED", providerRef: `MOCK-${Date.now()}` },
      });
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { cashBalance: cash.minus(amt).toString() },
      });
      await tx.transaction.create({
        data: { walletId: wallet.id, type: TransactionType.WITHDRAWAL, amount: amt.neg().toString(), description: `${method} withdrawal` },
      });
      return w;
    });
    return { id: withdrawal.id, status: "COMPLETED", amount: amt, method };
  }

  async getWithdrawalStatus(withdrawalId: string): Promise<WithdrawalResult> {
    const withdrawal = await db.withdrawal.findUniqueOrThrow({ where: { id: withdrawalId } });
    return {
      id: withdrawal.id,
      status: withdrawal.status,
      amount: new Decimal(withdrawal.amount.toString()),
      method: withdrawal.method,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}
