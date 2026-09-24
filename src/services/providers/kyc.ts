import { db } from "@/lib/db";
import { KYCStatus } from "@/generated/prisma/client";

export interface KYCSubmission {
  fullName: string;
  dateOfBirth: string; // ISO date
  idNumber: string;
  idDocumentUrl?: string;
  addressDocumentUrl?: string;
}

export interface KYCStatusView {
  status: KYCStatus;
  fullName: string | null;
  rejectionReason: string | null;
  submittedAt: Date | null;
}

/**
 * Abstraction over identity verification. A real provider (Smile ID,
 * Persona, ...) plugs in here later — the KYC UI and admin review queue
 * only ever call this interface, never a vendor SDK directly.
 */
export interface KYCProvider {
  submitApplication(userId: string, submission: KYCSubmission): Promise<KYCStatusView>;
  getStatus(userId: string): Promise<KYCStatusView>;
}

/** Leaves new submissions PENDING so the admin review queue has real work — no auto-approval. */
export class MockKYCProvider implements KYCProvider {
  async submitApplication(userId: string, submission: KYCSubmission): Promise<KYCStatusView> {
    const application = await db.kYCApplication.upsert({
      where: { userId },
      create: {
        userId,
        status: "PENDING",
        fullName: submission.fullName,
        dateOfBirth: new Date(submission.dateOfBirth),
        idNumber: submission.idNumber,
        idDocumentUrl: submission.idDocumentUrl,
        addressDocumentUrl: submission.addressDocumentUrl,
      },
      update: {
        status: "PENDING",
        fullName: submission.fullName,
        dateOfBirth: new Date(submission.dateOfBirth),
        idNumber: submission.idNumber,
        idDocumentUrl: submission.idDocumentUrl,
        addressDocumentUrl: submission.addressDocumentUrl,
        rejectionReason: null,
      },
    });
    return {
      status: application.status,
      fullName: application.fullName,
      rejectionReason: application.rejectionReason,
      submittedAt: application.createdAt,
    };
  }

  async getStatus(userId: string): Promise<KYCStatusView> {
    const application = await db.kYCApplication.findUnique({ where: { userId } });
    if (!application) {
      return { status: "NOT_STARTED", fullName: null, rejectionReason: null, submittedAt: null };
    }
    return {
      status: application.status,
      fullName: application.fullName,
      rejectionReason: application.rejectionReason,
      submittedAt: application.createdAt,
    };
  }
}

export function getKYCProvider(): KYCProvider {
  return new MockKYCProvider();
}
