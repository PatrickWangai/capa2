import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';
import {
  createBot, getBots, getBot, updateBot, deleteBot, getBotTrades, adminGetAllBots,
} from '../controllers/botsController.js';

const router = Router();

router.use(authenticate);

router.get('/',           getBots);
router.post('/',          createBot);
router.get('/admin/all',  requireAdmin(), adminGetAllBots);
router.get('/:id',        getBot);
router.patch('/:id',      updateBot);
router.delete('/:id',     deleteBot);
router.get('/:id/trades', getBotTrades);

export default router;
