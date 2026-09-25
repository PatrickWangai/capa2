import { Router } from 'express';
const router = Router();
import * as c from '../controllers/alertsController.js';
import auth from '../middleware/authenticate.js';
router.get('/', auth, c.getAlerts);
router.post('/', auth, c.createAlert);
router.delete('/:id', auth, c.deleteAlert);
router.patch('/:id/toggle', auth, c.toggleAlert);
export default router;
