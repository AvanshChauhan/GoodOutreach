import { Router } from 'express';
import {
  getOutreach,
  getOutreachById,
  approveOutreachController,
  sendOutreachController,
  simulateOutreachController,
  updateOutreachController,
} from '../controllers/outreachController';

const router = Router();
router.get('/', getOutreach);
router.get('/:id', getOutreachById);
router.patch('/:id', updateOutreachController);
router.post('/:id/approve', approveOutreachController);
router.post('/:id/send', sendOutreachController);
router.post('/:id/simulate', simulateOutreachController);

export default router;
