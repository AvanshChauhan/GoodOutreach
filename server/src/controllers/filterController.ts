import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { runFilter } from '../services/filtering/filteringService';
import { Influencer } from '../models/Influencer';
import { AppError } from '../middleware/errorHandler';

const FilterConfigSchema = z.object({
  niche: z.string().default('fitness'),
  minFollowers: z.coerce.number().min(0).default(5000),
  maxFollowers: z.coerce.number().min(0).default(100000),
  minEngagementRate: z.coerce.number().min(0).default(2),
  requiredPlatforms: z
    .array(z.enum(['Instagram', 'YouTube', 'TikTok', 'Other']))
    .default(['Instagram', 'YouTube', 'TikTok']),
  requireEmail: z.boolean().default(true),
  reset: z.boolean().default(false),
});

export async function runFilterController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = FilterConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        `Invalid filter config: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    const { reset, ...filterConfig } = parsed.data;
    const result = await runFilter(filterConfig, reset);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getFilterResults(req: Request, res: Response, next: NextFunction) {
  try {
    const [qualified, rejected, pending, total] = await Promise.all([
      Influencer.find({ filterStatus: 'qualified' }).sort({ createdAt: -1 }),
      Influencer.find({ filterStatus: 'rejected' }).sort({ createdAt: -1 }),
      Influencer.find({ filterStatus: 'pending' }).sort({ createdAt: -1 }),
      Influencer.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total,
          qualified: qualified.length,
          rejected: rejected.length,
          pending: pending.length,
        },
        qualified,
        rejected,
        pending,
      },
    });
  } catch (err) {
    next(err);
  }
}
