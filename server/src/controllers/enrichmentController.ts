import { Request, Response, NextFunction } from 'express';
import { runEnrichment, enrichInfluencer } from '../services/enrichment/enrichmentService';
import { AppError } from '../middleware/errorHandler';

export async function runEnrichmentController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await runEnrichment();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function enrichOneController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await enrichInfluencer(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
