import { Router } from 'express';
import multer from 'multer';
import {
  getInfluencers,
  getInfluencerById,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  importInfluencers,
} from '../controllers/influencerController';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.get('/', getInfluencers);
router.get('/:id', getInfluencerById);
router.post('/', createInfluencer);
router.post('/import', upload.single('file'), importInfluencers);
router.patch('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

export default router;
