import { Router } from 'express';
const router = Router();
import * as c from '../controllers/notificationsController.js';
import auth from '../middleware/authenticate.js';
router.get('/', auth, c.getNotifications);
router.post('/read', auth, c.markRead);
router.delete('/:id', auth, c.deleteNotification);
export default router;
