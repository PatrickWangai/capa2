import { prisma } from '../utils/db.js';
import bcrypt from 'bcryptjs';

export async function getProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, dateOfBirth: true, nationality: true, countryOfResidence: true, addressLine1: true, addressLine2: true, city: true, postalCode: true, taxId: true, kycStatus: true, status: true, mfaEnabled: true, referralCode: true, createdAt: true, lastLoginAt: true },
  });
  res.json({ user });
}

export async function updateProfile(req, res) {
  const { firstName, lastName, phone, dateOfBirth, nationality, addressLine1, addressLine2, city, postalCode, taxId } = req.body;
  if (taxId !== undefined && taxId !== null && taxId !== '') {
    const normalised = taxId.trim().toUpperCase();
    if (!/^[A-Z0-9]{9,15}$/.test(normalised)) {
      return res.status(400).json({ error: 'Invalid KRA PIN format.' });
    }
  }
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, nationality, addressLine1, addressLine2, city, postalCode, taxId: taxId ? taxId.trim().toUpperCase() : undefined },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, taxId: true, kycStatus: true },
  });
  res.json({ user });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }
  const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_ROUNDS) || 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
  res.json({ message: 'Password updated.' });
}
