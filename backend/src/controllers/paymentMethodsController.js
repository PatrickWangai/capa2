import { prisma } from '../utils/db.js';

// GET /api/payment-methods
export async function list(req, res) {
  const methods = await prisma.savedPaymentMethod.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
  res.json({ methods });
}

// POST /api/payment-methods
export async function create(req, res) {
  const { type, phone, bankName, bankAccount } = req.body;
  if (!type || !['MPESA', 'BANK_TRANSFER'].includes(type)) {
    return res.status(400).json({ error: 'type must be MPESA or BANK_TRANSFER' });
  }
  if (type === 'MPESA' && !phone) {
    return res.status(400).json({ error: 'phone is required for M-Pesa' });
  }
  if (type === 'BANK_TRANSFER' && (!bankName || !bankAccount)) {
    return res.status(400).json({ error: 'bankName and bankAccount are required for bank transfer' });
  }

  const label = type === 'MPESA' ? phone : `${bankName} ****${bankAccount.slice(-4)}`;

  const existing = await prisma.savedPaymentMethod.count({ where: { userId: req.user.id } });

  const method = await prisma.savedPaymentMethod.create({
    data: {
      userId: req.user.id,
      type,
      label,
      phone: type === 'MPESA' ? phone : null,
      bankName: type === 'BANK_TRANSFER' ? bankName : null,
      bankAccount: type === 'BANK_TRANSFER' ? bankAccount : null,
      isDefault: existing === 0,
    },
  });
  res.status(201).json({ method });
}

// DELETE /api/payment-methods/:id
export async function remove(req, res) {
  const method = await prisma.savedPaymentMethod.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!method) return res.status(404).json({ error: 'Not found' });
  await prisma.savedPaymentMethod.delete({ where: { id: method.id } });
  res.json({ ok: true });
}

// PATCH /api/payment-methods/:id/default
export async function setDefault(req, res) {
  const method = await prisma.savedPaymentMethod.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!method) return res.status(404).json({ error: 'Not found' });
  await prisma.$transaction([
    prisma.savedPaymentMethod.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } }),
    prisma.savedPaymentMethod.update({ where: { id: method.id }, data: { isDefault: true } }),
  ]);
  res.json({ ok: true });
}
