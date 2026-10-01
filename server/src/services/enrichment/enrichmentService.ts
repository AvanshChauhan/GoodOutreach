import { Influencer } from '../../models/Influencer';
import { isValidEmail, isValidUrl } from '../../utils/helpers';

export interface EnrichmentResult {
  influencerId: string;
  name: string;
  status: 'completed' | 'partial';
  foundFields: string[];
  missingFields: string[];
}

/**
 * Enrichment service.
 * For each qualified influencer, validates and marks which fields are present/missing.
 * In a production system, this would call external APIs (e.g., social media APIs,
 * web scraping services). For this prototype, it audits existing data quality.
 */
export async function enrichInfluencer(influencerId: string): Promise<EnrichmentResult> {
  const influencer = await Influencer.findById(influencerId);
  if (!influencer) throw new Error(`Influencer ${influencerId} not found`);

  const foundFields: string[] = [];
  const missingFields: string[] = [];

  const checkField = (
    label: string,
    value: unknown,
    validate?: (v: string) => boolean
  ) => {
    if (value === null || value === undefined || value === '') {
      missingFields.push(label);
    } else if (typeof value === 'string' && validate && !validate(value)) {
      missingFields.push(`${label} (invalid format)`);
    } else {
      foundFields.push(label);
    }
  };

  // Mandatory fields
  checkField('name', influencer.name);
  checkField('platform', influencer.platform);
  checkField('profileUrl', influencer.profileUrl, isValidUrl);
  checkField('followerCount', influencer.followerCount);
  checkField('engagementRate', influencer.engagementRate);
  checkField('niche', influencer.niche);
  checkField('contactEmail', influencer.contactEmail, isValidEmail);
  checkField('contentThemes', influencer.contentThemes.length > 0 ? 'present' : null);

  // Optional fields
  checkField('website', influencer.website);
  checkField('audienceAge', influencer.audienceAge);
  checkField('audienceGender', influencer.audienceGender);
  checkField('audienceGeography', influencer.audienceGeography);
  checkField('contentDescription', influencer.contentDescription);

  const status = missingFields.some((f) =>
    ['name', 'platform', 'profileUrl', 'niche'].some((m) => f.startsWith(m))
  )
    ? 'partial'
    : missingFields.length <= 5
    ? 'completed'
    : 'partial';

  influencer.enrichmentStatus = status;
  await influencer.save();

  return {
    influencerId,
    name: influencer.name,
    status,
    foundFields,
    missingFields,
  };
}

/** Run enrichment for all qualified influencers */
export async function runEnrichment() {
  const qualifiedInfluencers = await Influencer.find({ filterStatus: 'qualified' });
  const results: EnrichmentResult[] = [];
  let errors = 0;

  for (const inf of qualifiedInfluencers) {
    try {
      const result = await enrichInfluencer(inf.id);
      results.push(result);
    } catch (err) {
      errors++;
      console.error(`[Enrichment] Error for ${inf.name}:`, err);
    }
  }

  return {
    total: qualifiedInfluencers.length,
    completed: results.filter((r) => r.status === 'completed').length,
    partial: results.filter((r) => r.status === 'partial').length,
    errors,
    results,
  };
}
