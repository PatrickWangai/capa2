import { Router } from 'express';
const router = Router();
import * as c from '../controllers/usersController.js';
import auth from '../middleware/authenticate.js';
router.get('/me', auth, c.getProfile);
router.patch('/me', auth, c.updateProfile);
router.post('/me/password', auth, c.changePassword);
export default router;
