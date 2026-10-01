export type Platform = 'Instagram' | 'YouTube' | 'TikTok' | 'Other';
export type FilterStatus = 'pending' | 'qualified' | 'rejected';
export type EnrichmentStatus = 'pending' | 'completed' | 'partial';
export type PersonalizationStatus = 'pending' | 'generated' | 'failed';
export type OutreachStatus = 'draft' | 'approved' | 'sent' | 'simulated' | 'failed';

export interface Influencer {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Outreach {
  _id: string;
  influencerId: string | Influencer;
  email: string;
  emailSubject: string;
  emailMessage: string;
  instagramDM: string;
  status: OutreachStatus;
  sentAt: string | null;
  errorMessage: string | null;
  messageHash: string;
  personalizationSignals: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface InfluencersResponse {
  influencers: Influencer[];
  pagination: Pagination;
}

export interface FilterConfig {
  niche: string;
  minFollowers: number;
  maxFollowers: number;
  minEngagementRate: number;
  requiredPlatforms: Platform[];
  requireEmail: boolean;
  reset?: boolean;
}

export interface FilterRunResult {
  total: number;
  qualified: number;
  rejected: number;
  pending: number;
  processed: number;
  errors: number;
}

export interface DashboardStats {
  influencers: {
    total: number;
    qualified: number;
    rejected: number;
    pending: number;
  };
  outreach: {
    total: number;
    sent: number;
    simulated: number;
    failed: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  charts: {
    byPlatform: Array<{ platform: string; count: number }>;
    byNiche: Array<{ niche: string; count: number }>;
    filterStatus: Array<{ status: string; count: number }>;
  };
}

export interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
  invalid: number;
  duplicates: number;
  errors: Array<{ row: number; reason: string }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
