import { describe, it, expect } from 'vitest';
import { evaluateInfluencer, defaultFitnessConfig } from '../src/services/filtering/filteringEngine';
import { IInfluencer } from '../src/types';
import { Types } from 'mongoose';

function makeInfluencer(overrides: Partial<IInfluencer>): IInfluencer {
  return {
    _id: new Types.ObjectId(),
    name: 'Test Influencer',
    platform: 'Instagram',
    profileUrl: 'https://instagram.com/test',
    followerCount: 30000,
    engagementRate: 4.5,
    niche: 'fitness',
    contentThemes: ['strength training'],
    contentDescription: 'Daily workout tips',
    contactEmail: 'test@example.com',
    website: null,
    audienceAge: '18-34',
    audienceGender: 'Mixed',
    audienceGeography: 'US',
    source: 'test',
    sourceUrl: null,
    filterStatus: 'pending',
    rejectionReason: null,
    enrichmentStatus: 'pending',
    personalizationStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as IInfluencer;
}

describe('Filtering Engine', () => {
  it('qualifies a valid fitness micro-influencer', () => {
    const inf = makeInfluencer({});
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('qualified');
    expect(result.reasons).toHaveLength(0);
  });

  it('rejects if follower count exceeds maximum', () => {
    const inf = makeInfluencer({ followerCount: 150000 });
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('rejected');
    expect(result.reasons.some((r) => r.includes('Exceeds micro-influencer limit'))).toBe(true);
  });

  it('rejects if follower count is below minimum', () => {
    const inf = makeInfluencer({ followerCount: 1000 });
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('rejected');
    expect(result.reasons.some((r) => r.includes('Too few followers'))).toBe(true);
  });

  it('rejects if engagement rate is too low', () => {
    const inf = makeInfluencer({ engagementRate: 1.0 });
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('rejected');
    expect(result.reasons.some((r) => r.includes('Low engagement rate'))).toBe(true);
  });

  it('rejects if engagement rate is unavailable', () => {
    const inf = makeInfluencer({ engagementRate: null });
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('rejected');
    expect(result.reasons.some((r) => r.includes('Engagement rate unavailable'))).toBe(true);
  });

  it('rejects if niche does not match', () => {
    const inf = makeInfluencer({ niche: 'gaming' });
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('rejected');
    expect(result.reasons.some((r) => r.includes('Niche mismatch'))).toBe(true);
  });

  it('rejects if email is required but missing', () => {
    const inf = makeInfluencer({ contactEmail: null });
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('rejected');
    expect(result.reasons.some((r) => r.includes('Contact email unavailable'))).toBe(true);
  });

  it('qualifies even without email when email not required', () => {
    const config = { ...defaultFitnessConfig, requireEmail: false };
    const inf = makeInfluencer({ contactEmail: null });
    const result = evaluateInfluencer(inf, config);
    expect(result.status).toBe('qualified');
  });

  it('rejects if platform is not in required list', () => {
    const inf = makeInfluencer({ platform: 'Other' });
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.status).toBe('rejected');
    expect(result.reasons.some((r) => r.includes('Platform not in required list'))).toBe(true);
  });

  it('provides passed criteria for a qualified influencer', () => {
    const inf = makeInfluencer({});
    const result = evaluateInfluencer(inf, defaultFitnessConfig);
    expect(result.passedCriteria.length).toBeGreaterThan(0);
  });
});

describe('Duplicate Detection (via helpers)', () => {
  it('generates consistent hashes for same input', async () => {
    const { hashString } = await import('../src/utils/helpers');
    const hash1 = hashString('influencer-id:subject:body');
    const hash2 = hashString('influencer-id:subject:body');
    expect(hash1).toBe(hash2);
  });

  it('generates different hashes for different input', async () => {
    const { hashString } = await import('../src/utils/helpers');
    const hash1 = hashString('influencer-id:subject1:body1');
    const hash2 = hashString('influencer-id:subject2:body2');
    expect(hash1).not.toBe(hash2);
  });
});

describe('Personalization Word Count Validation', () => {
  it('validates word count is within 60-90 for email', async () => {
    const { wordCount } = await import('../src/utils/helpers');
    const shortEmail = 'Hi Sarah, hope you are well.';
    const validEmail = Array(70).fill('word').join(' ');
    const longEmail = Array(100).fill('word').join(' ');
    expect(wordCount(shortEmail)).toBeLessThan(60);
    expect(wordCount(validEmail)).toBeGreaterThanOrEqual(60);
    expect(wordCount(validEmail)).toBeLessThanOrEqual(90);
    expect(wordCount(longEmail)).toBeGreaterThan(90);
  });

  it('validates DM word count is within 15-30', async () => {
    const { wordCount } = await import('../src/utils/helpers');
    const validDM = Array(20).fill('word').join(' ');
    const shortDM = Array(5).fill('word').join(' ');
    const longDM = Array(40).fill('word').join(' ');
    expect(wordCount(validDM)).toBeGreaterThanOrEqual(15);
    expect(wordCount(validDM)).toBeLessThanOrEqual(30);
    expect(wordCount(shortDM)).toBeLessThan(15);
    expect(wordCount(longDM)).toBeGreaterThan(30);
  });
});
