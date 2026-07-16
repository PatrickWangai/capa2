import { Router } from 'express';
import auth from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import Joi from 'joi';
import {
  getWallets,
  convertCurrency,
  getConversions,
  getWalletTransactions,
  getFxRates,
  depositKes,
  withdrawKes,
} from '../controllers/walletController.js';

const router = Router();

const convertSchema = Joi.object({
  fromCurrency: Joi.string().valid('KES', 'USD').uppercase().required(),
  toCurrency:   Joi.string().valid('KES', 'USD').uppercase().required(),
  amount:       Joi.number().positive().max(10_000_000).required(),
});

const depositSchema = Joi.object({
  amount:      Joi.number().positive().max(10_000_000).required(),
  description: Joi.string().max(200).optional(),
});

const withdrawSchema = Joi.object({
  amount:      Joi.number().positive().max(10_000_000).required(),
  phone:       Joi.string().optional(),
  description: Joi.string().max(200).optional(),
});

// Balances & rates
router.get('/',             auth, getWallets);
router.get('/fx-rates',     auth, getFxRates);
router.get('/conversions',  auth, getConversions);
router.get('/transactions', auth, getWalletTransactions);

// Actions
router.post('/convert',      auth, validate(convertSchema),  convertCurrency);
router.post('/deposit-kes',  auth, validate(depositSchema),  depositKes);
router.post('/withdraw-kes', auth, validate(withdrawSchema), withdrawKes);

export default router;
