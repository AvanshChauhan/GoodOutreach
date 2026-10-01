import { Router } from 'express';
import { runFilterController, getFilterResults } from '../controllers/filterController';

const router = Router();
router.post('/run', runFilterController);
router.get('/results', getFilterResults);

export default router;
