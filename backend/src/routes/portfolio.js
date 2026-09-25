import { Router } from 'express';
const router = Router();
import * as c from '../controllers/portfolioController.js';
import auth from '../middleware/authenticate.js';
router.get('/', auth, c.getPortfolio);
router.get('/history', auth, c.getPortfolioHistory);
router.get('/dividends', auth, c.getDividends);
export default router;
