export default (req, res, next) => {
  if (req.user.kycStatus !== 'APPROVED') {
    return res.status(403).json({
      error: 'KYC verification required to perform this action.',
      kycStatus: req.user.kycStatus,
    });
  }
  next();
}
