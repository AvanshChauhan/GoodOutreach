import { Document, Types } from 'mongoose';

export type Platform = 'Instagram' | 'YouTube' | 'TikTok' | 'Other';
export type FilterStatus = 'pending' | 'qualified' | 'rejected';
export type EnrichmentStatus = 'pending' | 'completed' | 'partial';
export type PersonalizationStatus = 'pending' | 'generated' | 'failed';
export type OutreachStatus = 'draft' | 'approved' | 'sent' | 'simulated' | 'failed';

export interface IInfluencer extends Document {
  name: string;
  platform: Platform;
  profileUrl: string;
  followerCount: number | null;
  engagementRate: number | null;
  niche: string;
  contentThemes: string[];
  contentDescription: string | null;
  contactEmail: string | null;
  website: string | null;
  audienceAge: string | null;
  audienceGender: string | null;
  audienceGeography: string | null;
  source: string;
  sourceUrl: string | null;
  filterStatus: FilterStatus;
  rejectionReason: string | null;
  enrichmentStatus: EnrichmentStatus;
  personalizationStatus: PersonalizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOutreach extends Document {
  influencerId: Types.ObjectId;
  email: string;
  emailSubject: string;
  emailMessage: string;
  instagramDM: string;
  status: OutreachStatus;
  sentAt: Date | null;
  errorMessage: string | null;
  messageHash: string;
  personalizationSignals: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterConfig {
  niche: string;
  minFollowers: number;
  maxFollowers: number;
  minEngagementRate: number;
  requiredPlatforms: Platform[];
  requireEmail: boolean;
}

export interface ContentAnalysis {
  contentThemes: string[];
  tone: string;
  audience: string;
  collaborationAngles: string[];
}

export interface PersonalizationResult {
  emailSubject: string;
  emailBody: string;
  instagramDM: string;
  personalizationSignals: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
  invalid: number;
  duplicates: number;
  errors: Array<{ row: number; reason: string }>;
}
