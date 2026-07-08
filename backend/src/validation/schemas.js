import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  phone: Joi.string().max(20).allow('', null),
  country: Joi.string().length(2).uppercase().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  mfaCode: Joi.string().length(6).allow('', null),
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
