import { FilterConfig, IInfluencer } from '../../types';

export interface FilterResult {
  status: 'qualified' | 'rejected';
  reasons: string[];
  passedCriteria: string[];
}

/** Default fitness filter configuration */
export const defaultFitnessConfig: FilterConfig = {
  niche: 'fitness',
  minFollowers: 5000,
  maxFollowers: 100000,
  minEngagementRate: 2,
  requiredPlatforms: ['Instagram', 'YouTube', 'TikTok'],
  requireEmail: true,
};

/** Configurable filtering engine — evaluates one influencer against a FilterConfig */
export function evaluateInfluencer(
  influencer: IInfluencer,
  config: FilterConfig
): FilterResult {
  const rejectionReasons: string[] = [];
  const passedCriteria: string[] = [];

  // 1. Niche check
  const influencerNiche = (influencer.niche || '').toLowerCase();
  const configNiche = config.niche.toLowerCase();
  if (influencerNiche.includes(configNiche) || configNiche.includes(influencerNiche)) {
    passedCriteria.push(`Niche matches: ${influencer.niche}`);
  } else {
    rejectionReasons.push(
      `Niche mismatch: expected "${config.niche}", got "${influencer.niche}"`
    );
  }

  // 2. Follower count
  if (influencer.followerCount === null) {
    rejectionReasons.push('Follower count unavailable');
  } else if (influencer.followerCount < config.minFollowers) {
    rejectionReasons.push(
      `Too few followers: ${influencer.followerCount.toLocaleString()} (min ${config.minFollowers.toLocaleString()})`
    );
  } else if (influencer.followerCount > config.maxFollowers) {
    rejectionReasons.push(
      `Exceeds micro-influencer limit: ${influencer.followerCount.toLocaleString()} (max ${config.maxFollowers.toLocaleString()})`
    );
  } else {
    passedCriteria.push(
      `Follower count in range: ${influencer.followerCount.toLocaleString()}`
    );
  }

  // 3. Engagement rate
  if (influencer.engagementRate === null) {
    rejectionReasons.push('Engagement rate unavailable');
  } else if (influencer.engagementRate < config.minEngagementRate) {
    rejectionReasons.push(
      `Low engagement rate: ${influencer.engagementRate}% (min ${config.minEngagementRate}%)`
    );
  } else {
    passedCriteria.push(`Engagement rate: ${influencer.engagementRate}%`);
  }

  // 4. Platform
  if (!config.requiredPlatforms.includes(influencer.platform)) {
    rejectionReasons.push(
      `Platform not in required list: ${influencer.platform}`
    );
  } else {
    passedCriteria.push(`Platform: ${influencer.platform}`);
  }

  // 5. Email requirement
  if (config.requireEmail) {
    if (!influencer.contactEmail) {
      rejectionReasons.push('Contact email unavailable');
    } else {
      passedCriteria.push('Contact email available');
    }
  }

  return {
    status: rejectionReasons.length === 0 ? 'qualified' : 'rejected',
    reasons: rejectionReasons,
    passedCriteria,
  };
}
