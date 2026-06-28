import { Router } from 'express';
const router = Router();
import * as c from '../controllers/authController.js';
import auth from '../middleware/authenticate.js';

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/refresh', c.refresh);
router.get('/me', auth, c.me);
router.post('/logout', auth, c.logout);

// Password reset (public)
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);

// Email verification
router.post('/verify-email', c.verifyEmail);
router.post('/resend-verification', auth, c.resendVerification);

// MFA
router.post('/mfa/setup', auth, c.mfaSetup);
router.post('/mfa/verify', auth, c.mfaVerify);

// Profile management (authenticated)
router.put('/profile', auth, c.updateProfile);
router.put('/change-password', auth, c.changePassword);

export default router;
