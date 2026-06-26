import { prisma } from '../utils/db.js';
import { uploadToS3 } from '../services/s3Service.js';
import { createNotification } from '../services/notificationService.js';
import logger from '../utils/logger.js';

// GET /api/kyc/status
export async function getStatus(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { kycStatus: true },
  });
  const docs = await prisma.kycDocument.findMany({
    where: { userId: req.user.id },
    select: { id: true, documentType: true, status: true, createdAt: true, rejectionReason: true },
  });
  res.json({ kycStatus: user.kycStatus, documents: docs });
}

// POST /api/kyc/upload (multipart/form-data)
export async function uploadDocument(req, res) {
  const { documentType, documentNumber, issueDate, expiryDate, countryIssued } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const { url, key } = await uploadToS3(req.file, `kyc/${req.user.id}`);

  const doc = await prisma.kycDocument.create({
    data: {
      userId: req.user.id,
      documentType,
      documentNumber,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      countryIssued,
      fileUrl: url,
      fileKey: key,
      status: 'PENDING',
    },
  });

  await prisma.user.update({ where: { id: req.user.id }, data: { kycStatus: 'PENDING' } });

  logger.info('KYC document uploaded', { userId: req.user.id, docId: doc.id, type: documentType });
  res.status(201).json({ document: doc, message: 'Document submitted for review.' });
}

// ADMIN: GET /api/admin/kyc/pending
export async function listPending(req, res) {
  const docs = await prisma.kycDocument.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });
  res.json({ documents: docs });
}

// ADMIN: PATCH /api/admin/kyc/:docId/review
export async function reviewDocument(req, res) {
  const { decision, rejectionReason } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ error: 'Decision must be APPROVED or REJECTED.' });
  }

  const doc = await prisma.kycDocument.update({
    where: { id: req.params.docId },
    data: { status: decision, rejectionReason: decision === 'REJECTED' ? rejectionReason : null, reviewedById: req.user.id, reviewedAt: new Date() },
    include: { user: true },
  });

  // Update user KYC status
  const allDocs = await prisma.kycDocument.findMany({ where: { userId: doc.userId } });
  const hasApproved = allDocs.some(d => d.status === 'APPROVED');
  const userKycStatus = hasApproved ? 'APPROVED' : (decision === 'REJECTED' ? 'REJECTED' : 'PENDING');
  await prisma.user.update({ where: { id: doc.userId }, data: { kycStatus: userKycStatus, status: userKycStatus === 'APPROVED' ? 'ACTIVE' : undefined } });

  await createNotification({
    userId: doc.userId,
    type: 'KYC_UPDATE',
    title: decision === 'APPROVED' ? 'KYC Verified!' : 'KYC Review Update',
    body: decision === 'APPROVED'
      ? 'Your identity has been verified. You can now start investing!'
      : `Your document was not approved. Reason: ${rejectionReason}. Please re-submit.`,
    metadata: { docId: doc.id, decision },
  });

  res.json({ document: doc, message: `Document ${decision.toLowerCase()}.` });
}
