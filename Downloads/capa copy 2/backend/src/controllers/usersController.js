import { prisma } from '../utils/db.js';
import bcrypt from 'bcryptjs';

export async function getProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, dateOfBirth: true, nationality: true, countryOfResidence: true, addressLine1: true, addressLine2: true, city: true, postalCode: true, kycStatus: true, status: true, mfaEnabled: true, referralCode: true, createdAt: true, lastLoginAt: true },
  });
  res.json({ user });
}

export async function updateProfile(req, res) {
  const { firstName, lastName, phone, dateOfBirth, nationality, addressLine1, addressLine2, city, postalCode } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, nationality, addressLine1, addressLine2, city, postalCode },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, kycStatus: true },
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
