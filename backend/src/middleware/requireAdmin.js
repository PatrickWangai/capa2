import { prisma } from '../utils/db.js';

export default (...allowedRoles) => async (req, res, next) => {
  const role = await prisma.userRole.findUnique({ where: { userId: req.user.id } });
  if (!role) return res.status(403).json({ error: 'Admin access required.' });
  if (allowedRoles.length && !allowedRoles.includes(role.role)) {
    return res.status(403).json({ error: 'Insufficient admin permissions.' });
  }
  req.adminRole = role;
  next();
}
