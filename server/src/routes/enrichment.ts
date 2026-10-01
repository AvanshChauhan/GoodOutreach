import { Router } from 'express';
import { runEnrichmentController, enrichOneController } from '../controllers/enrichmentController';

const router = Router();
router.post('/run', runEnrichmentController);
router.post('/:id', enrichOneController);

export default router;
