import { Request, Response, NextFunction } from 'express';
import {
  generatePersonalization,
  getActiveProviderName,
} from '../services/personalization/personalizationService';
import { Influencer } from '../models/Influencer';
import { Outreach } from '../models/Outreach';
import { AppError } from '../middleware/errorHandler';

export async function generatePersonalizationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;
    const result = await generatePersonalization(id);

    const outreach = await Outreach.findOne({ influencerId: id });
    res.json({
      success: true,
      data: { result, outreach, provider: getActiveProviderName() },
    });
  } catch (err) {
    next(err);
  }
}

export async function regeneratePersonalizationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;
    // Reset status so it can be regenerated
    await Influencer.findByIdAndUpdate(id, { personalizationStatus: 'pending' });
    const result = await generatePersonalization(id);
    const outreach = await Outreach.findOne({ influencerId: id });
    res.json({
      success: true,
      data: { result, outreach, provider: getActiveProviderName() },
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkGenerateController(req: Request, res: Response, next: NextFunction) {
  try {
    const influencers = await Influencer.find({
      filterStatus: 'qualified',
      personalizationStatus: { $ne: 'generated' },
    });

    const results = [];
    for (const inf of influencers) {
      const result = await generatePersonalization(inf.id);
      results.push(result);
    }

    const generated = results.filter((r) => r.status === 'generated').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    res.json({
      success: true,
      data: { total: results.length, generated, failed, results, provider: getActiveProviderName() },
    });
  } catch (err) {
    next(err);
  }
}
