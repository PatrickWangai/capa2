import { Router } from 'express';
import auth from '../middleware/authenticate.js';
import * as c from '../controllers/paymentMethodsController.js';

const router = Router();

router.get('/',           auth, c.list);
router.post('/',          auth, c.create);
router.delete('/:id',     auth, c.remove);
router.patch('/:id/default', auth, c.setDefault);

export default router;
