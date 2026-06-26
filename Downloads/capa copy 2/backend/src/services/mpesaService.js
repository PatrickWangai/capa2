import axios from 'axios';
import logger from '../utils/logger.js';

const BASE = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

async function getToken() {
  const creds = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
  });
  return data.access_token;
}

export async function initiateMpesaSTKPush({ phone, amount, reference }) {
  const token = await getToken();
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
  const normalized = phone.startsWith('0') ? '254' + phone.slice(1) : phone.startsWith('+') ? phone.slice(1) : phone;

  const { data } = await axios.post(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(Number(amount)),
    PartyA: normalized,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: normalized,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: 'Capa',
    TransactionDesc: `Deposit ${reference}`,
  }, { headers: { Authorization: `Bearer ${token}` } });

  logger.info('M-Pesa STK push initiated', { reference, phone: normalized });
  return data;
}
