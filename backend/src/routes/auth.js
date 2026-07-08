import { Router } from 'express';
const router = Router();
import * as c from '../controllers/authController.js';
import auth from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import {
  registerSchema, loginSchema, refreshSchema,
  forgotPasswordSchema, resetPasswordSchema, changePasswordSchema,
} from '../validation/schemas.js';

router.post('/register', validate(registerSchema), c.register);
router.post('/login', validate(loginSchema), c.login);
router.post('/refresh', validate(refreshSchema), c.refresh);
router.get('/me', auth, c.me);
router.post('/logout', auth, c.logout);

// Password reset (public)
router.post('/forgot-password', validate(forgotPasswordSchema), c.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), c.resetPassword);

// Email verification
router.post('/verify-email', c.verifyEmail);
router.post('/resend-verification', auth, c.resendVerification);

// MFA
router.post('/mfa/setup', auth, c.mfaSetup);
router.post('/mfa/verify', auth, c.mfaVerify);

// Profile management (authenticated)
router.put('/profile', auth, c.updateProfile);
router.put('/change-password', auth, validate(changePasswordSchema), c.changePassword);

export default router;
