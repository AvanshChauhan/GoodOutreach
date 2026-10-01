import { Influencer } from '../../models/Influencer';
import { FilterConfig, IInfluencer } from '../../types';
import { evaluateInfluencer } from './filteringEngine';

export interface FilterRunResult {
  total: number;
  qualified: number;
  rejected: number;
  pending: number;
  processed: number;
  errors: number;
}

/**
 * Run the filter on all pending influencers (or all if reset=true).
 * Updates filterStatus and rejectionReason in the database.
 */
export async function runFilter(
  config: FilterConfig,
  reset = false
): Promise<FilterRunResult> {
  const query = reset ? {} : { filterStatus: 'pending' };
  const influencers = await Influencer.find(query);

  let qualified = 0;
  let rejected = 0;
  let errors = 0;

  for (const inf of influencers) {
    try {
      const result = evaluateInfluencer(inf as IInfluencer, config);
      inf.filterStatus = result.status;
      inf.rejectionReason =
        result.status === 'rejected' ? result.reasons.join('; ') : null;
      await inf.save();

      if (result.status === 'qualified') qualified++;
      else rejected++;
    } catch (err) {
      errors++;
      console.error(`[Filter] Error evaluating ${inf.name}:`, err);
    }
  }

  const pending = await Influencer.countDocuments({ filterStatus: 'pending' });

  return {
    total: await Influencer.countDocuments(),
    qualified,
    rejected,
    pending,
    processed: influencers.length,
    errors,
  };
}
