import { Router } from 'express';
const router = Router();
import * as c from '../controllers/kycController.js';
import auth from '../middleware/authenticate.js';
import multer from 'multer';

// KYC docs are photos/scans of IDs — restrict tightly. SVG is deliberately
// excluded even though it looks like an "image" type: it can embed <script>
// and cause stored XSS when rendered inline for an admin reviewer.
const ALLOWED_MIMETYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
      const err = new Error('Unsupported file type. Upload a JPEG, PNG, WebP, or PDF.');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});
router.get('/status', auth, c.getStatus);
router.post('/upload', auth, upload.single('file'), c.uploadDocument);
export default router;
