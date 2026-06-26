import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendEmail({ to, subject, html, text }) {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html, text });
  } catch (e) {
    logger.error('Email send failed', { error: e.message, to, subject });
  }
}
