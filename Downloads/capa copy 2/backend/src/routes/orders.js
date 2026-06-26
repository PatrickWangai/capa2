import { Router } from 'express';
const router = Router();
import * as c from '../controllers/ordersController.js';
import auth from '../middleware/authenticate.js';
import requireKyc from '../middleware/requireKyc.js';
router.get('/', auth, c.getOrders);
router.post('/', auth, requireKyc, c.placeOrder);
router.delete('/:id', auth, c.cancelOrder);
export default router;
