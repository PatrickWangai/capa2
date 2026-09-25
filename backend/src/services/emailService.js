import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const BASE = process.env.FRONTEND_URL || 'https://capa-q1nh.onrender.com';

function wrap(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="100%" style="max-width:520px;background:#1c1c1e;border-radius:18px;padding:40px;border:1px solid rgba(255,255,255,0.08);" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;padding-bottom:32px;">
  <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#10b981;">
    <span style="color:#ffffff;font-size:26px;font-weight:800;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;line-height:1;">C</span>
  </div>
  <h1 style="margin:10px 0 0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Capa</h1>
</td></tr>
<tr><td>${body}</td></tr>
<tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.08);margin-top:32px;text-align:center;">
  <p style="margin:0;font-size:12px;color:rgba(235,235,245,0.4);">Capa Investments Ltd &bull; Regulated investment platform &bull; Capital at risk</p>
  <p style="margin:4px 0 0;font-size:12px;color:rgba(235,235,245,0.4);">If you didn't request this email, you can safely ignore it.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

export async function sendEmail({ to, subject, html, text }) {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'Capa <noreply@capa.invest>', to, subject, html, text });
  } catch (e) {
    logger.error('Email send failed', { error: e.message, to, subject });
  }
}

export async function sendPasswordResetEmail(to, token) {
  const url = `${BASE}/reset-password?token=${token}`;
  await sendEmail({
    to, subject: 'Reset your Capa password',
    html: wrap('Reset your password', `
      <h2 style="margin:0 0 8px;color:#ffffff;font-size:20px;font-weight:700;">Reset your password</h2>
      <p style="margin:0 0 24px;color:rgba(235,235,245,0.6);font-size:15px;line-height:1.6;">We received a request to reset the password for your Capa account. Click the button below — this link expires in 1 hour.</p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:24px;">
        <a href="${url}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:980px;font-size:17px;font-weight:500;">Reset Password</a>
      </td></tr></table>
      <p style="margin:0;font-size:13px;color:rgba(235,235,245,0.4);word-break:break-all;">Or copy this link: ${url}</p>
    `),
    text: `Reset your Capa password: ${url}\n\nThis link expires in 1 hour.`,
  });
}

export async function sendVerifyEmail(to, token, firstName) {
  const url = `${BASE}/verify-email?token=${token}`;
  await sendEmail({
    to, subject: 'Verify your Capa email address',
    html: wrap('Verify your email', `
      <h2 style="margin:0 0 8px;color:#ffffff;font-size:20px;font-weight:700;">Welcome to Capa, ${firstName}!</h2>
      <p style="margin:0 0 24px;color:rgba(235,235,245,0.6);font-size:15px;line-height:1.6;">Please verify your email address to activate your account and start investing.</p>
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:24px;">
        <a href="${url}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:980px;font-size:17px;font-weight:500;">Verify Email</a>
      </td></tr></table>
      <p style="margin:0;font-size:13px;color:rgba(235,235,245,0.4);word-break:break-all;">Or copy this link: ${url}</p>
    `),
    text: `Verify your Capa email: ${url}`,
  });
}

export async function sendDepositReceiptEmail(to, firstName, amount, currency, reference) {
  await sendEmail({
    to, subject: `Deposit confirmed — ${currency} ${amount}`,
    html: wrap('Deposit confirmed', `
      <h2 style="margin:0 0 8px;color:#ffffff;font-size:20px;font-weight:700;">Deposit received</h2>
      <p style="margin:0 0 24px;color:rgba(235,235,245,0.6);font-size:15px;">Hi ${firstName}, your deposit has been confirmed and added to your account.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:24px;">
        <tr><td style="color:rgba(235,235,245,0.6);font-size:14px;padding:6px 0;">Amount</td><td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${currency} ${Number(amount).toLocaleString()}</td></tr>
        <tr><td style="color:rgba(235,235,245,0.6);font-size:14px;padding:6px 0;">Reference</td><td style="color:#ffffff;font-size:14px;text-align:right;">${reference}</td></tr>
        <tr><td style="color:rgba(235,235,245,0.6);font-size:14px;padding:6px 0;">Status</td><td style="color:#30d158;font-size:14px;font-weight:600;text-align:right;">Confirmed</td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <a href="${BASE}/dashboard" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:980px;font-size:16px;">View Dashboard</a>
      </td></tr></table>
    `),
    text: `Deposit confirmed: ${currency} ${amount} (ref: ${reference})`,
  });
}
