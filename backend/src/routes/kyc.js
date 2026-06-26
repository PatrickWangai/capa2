import { Router } from 'express';
const router = Router();
import * as c from '../controllers/kycController.js';
import auth from '../middleware/authenticate.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.get('/status', auth, c.getStatus);
router.post('/upload', auth, upload.single('file'), c.uploadDocument);
export default router;
