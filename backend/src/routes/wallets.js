import { Router } from 'express';
import auth from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import Joi from 'joi';
import {
  getWallets, getFxRates, convertCurrency,
  getConversions, getWalletTransactions,
  deposit, withdraw,
  depositKes, withdrawKes,
} from '../controllers/walletController.js';

const router = Router();

const CURRENCIES = ['USD','GBP','KES','EUR','CAD','AUD','JPY','CHF','HKD','SGD','ZAR'];
const METHODS    = ['MPESA','BANK_TRANSFER'];

const convertSchema = Joi.object({
  fromCurrency: Joi.string().valid(...CURRENCIES).uppercase().required(),
  toCurrency:   Joi.string().valid(...CURRENCIES).uppercase().required(),
  amount:       Joi.number().positive().max(100_000_000).required(),
});

const depositSchema = Joi.object({
  amount:      Joi.number().positive().max(100_000_000).required(),
  currency:    Joi.string().valid(...CURRENCIES).uppercase().default('KES'),
  method:      Joi.string().valid(...METHODS).default('MPESA'),
  phone:       Joi.string().max(20).optional(),
  bankAccount: Joi.string().max(30).optional(),
  bankCode:    Joi.string().max(20).optional(),
  description: Joi.string().max(200).optional(),
});

const withdrawSchema = Joi.object({
  amount:      Joi.number().positive().max(100_000_000).required(),
  currency:    Joi.string().valid(...CURRENCIES).uppercase().default('KES'),
  method:      Joi.string().valid(...METHODS).default('MPESA'),
  phone:       Joi.string().max(20).optional(),
  bankAccount: Joi.string().max(30).optional(),
  bankCode:    Joi.string().max(20).optional(),
});

// Balances & rates
router.get ('/',              auth, getWallets);
router.get ('/fx-rates',      auth, getFxRates);
router.get ('/conversions',   auth, getConversions);
router.get ('/transactions',  auth, getWalletTransactions);

// Actions
router.post('/convert',       auth, validate(convertSchema),  convertCurrency);
router.post('/deposit',       auth, validate(depositSchema),  deposit);
router.post('/withdraw',      auth, validate(withdrawSchema), withdraw);

// Legacy (kept for backwards compat)
router.post('/deposit-kes',   auth, depositKes);
router.post('/withdraw-kes',  auth, withdrawKes);

export default router;
