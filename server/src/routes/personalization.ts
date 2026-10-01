import { Router } from 'express';
import {
  generatePersonalizationController,
  regeneratePersonalizationController,
  bulkGenerateController,
} from '../controllers/personalizationController';

const router = Router();
router.post('/generate/:id', generatePersonalizationController);
router.post('/regenerate/:id', regeneratePersonalizationController);
router.post('/bulk-generate', bulkGenerateController);

export default router;
