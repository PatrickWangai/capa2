import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(128).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  phone: Joi.string().max(20).allow('', null),
  country: Joi.string().length(2).uppercase().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
  mfaCode: Joi.string().length(6).optional().allow('', null),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

export const placeOrderSchema = Joi.object({
  assetId: Joi.string().required(),
  side: Joi.string().valid('BUY', 'SELL').required(),
  orderType: Joi.string().valid('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT').default('MARKET'),
  quantity: Joi.number().positive().required(),
  limitPrice: Joi.number().positive(),
  stopPrice: Joi.number().positive(),
});

export const mpesaDepositSchema = Joi.object({
  amount: Joi.number().positive().max(10_000_000).required(),
  phone: Joi.string().pattern(/^\+?\d{9,15}$/).required(),
  currency: Joi.string().valid('KES').default('KES'),
});

export const bankDepositSchema = Joi.object({
  amount: Joi.number().positive().max(10_000_000).required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  bankName: Joi.string().max(100).allow('', null),
  bankAccount: Joi.string().max(50).allow('', null),
});

export const withdrawSchema = Joi.object({
  amount: Joi.number().positive().max(10_000_000).required(),
  currency: Joi.string().length(3).uppercase().required(),
  method: Joi.string().valid('BANK_TRANSFER', 'MPESA', 'AIRTEL_MONEY', 'SWIFT', 'SEPA').required(),
  phone: Joi.string().pattern(/^\+?\d{9,15}$/).allow('', null),
  bankAccount: Joi.string().max(50).allow('', null),
  bankName: Joi.string().max(100).allow('', null),
});

export const walletConvertSchema = Joi.object({
  fromCurrency: Joi.string().length(3).uppercase().required(),
  toCurrency: Joi.string().length(3).uppercase().required(),
  amount: Joi.number().positive().max(10_000_000).required(),
});
