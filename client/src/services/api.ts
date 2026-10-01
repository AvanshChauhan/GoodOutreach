import axios from 'axios';
import type {
  Influencer,
  InfluencersResponse,
  FilterConfig,
  FilterRunResult,
  DashboardStats,
  ImportSummary,
  Outreach,
  ApiResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error || err.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Influencers ──────────────────────────────────────────────────────────────

export const getInfluencers = async (params: {
  page?: number;
  limit?: number;
  filterStatus?: string;
  platform?: string;
  niche?: string;
  search?: string;
}): Promise<ApiResponse<InfluencersResponse>> => {
  const { data } = await api.get('/influencers', { params });
  return data;
};

export const getInfluencerById = async (id: string): Promise<ApiResponse<Influencer>> => {
  const { data } = await api.get(`/influencers/${id}`);
  return data;
};

export const createInfluencer = async (
  payload: Partial<Influencer>
): Promise<ApiResponse<Influencer>> => {
  const { data } = await api.post('/influencers', payload);
  return data;
};

export const updateInfluencer = async (
  id: string,
  payload: Partial<Influencer>
): Promise<ApiResponse<Influencer>> => {
  const { data } = await api.patch(`/influencers/${id}`, payload);
  return data;
};

export const deleteInfluencer = async (id: string): Promise<ApiResponse> => {
  const { data } = await api.delete(`/influencers/${id}`);
  return data;
};

export const importInfluencers = async (
  file: File
): Promise<ApiResponse<ImportSummary>> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/influencers/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ── Filter ───────────────────────────────────────────────────────────────────

export const runFilter = async (
  config: FilterConfig
): Promise<ApiResponse<FilterRunResult>> => {
  const { data } = await api.post('/filter/run', config);
  return data;
};

export const getFilterResults = async () => {
  const { data } = await api.get('/filter/results');
  return data;
};

// ── Enrichment ───────────────────────────────────────────────────────────────

export const runEnrichment = async () => {
  const { data } = await api.post('/enrichment/run');
  return data;
};

// ── Personalization ──────────────────────────────────────────────────────────

export const generatePersonalization = async (id: string) => {
  const { data } = await api.post(`/personalization/generate/${id}`);
  return data;
};

export const regeneratePersonalization = async (id: string) => {
  const { data } = await api.post(`/personalization/regenerate/${id}`);
  return data;
};

export const bulkGenerate = async () => {
  const { data } = await api.post('/personalization/bulk-generate');
  return data;
};

// ── Outreach ─────────────────────────────────────────────────────────────────

export const getOutreach = async (status?: string): Promise<ApiResponse<{
  outreach: Outreach[];
  summary: Record<string, number>;
}>> => {
  const params = status && status !== 'all' ? { status } : {};
  const { data } = await api.get('/outreach', { params });
  return data;
};

export const getOutreachById = async (id: string) => {
  const { data } = await api.get(`/outreach/${id}`);
  return data;
};

export const approveOutreach = async (id: string) => {
  const { data } = await api.post(`/outreach/${id}/approve`);
  return data;
};

export const sendOutreach = async (id: string) => {
  const { data } = await api.post(`/outreach/${id}/send`);
  return data;
};

export const simulateOutreach = async (id: string) => {
  const { data } = await api.post(`/outreach/${id}/simulate`);
  return data;
};

export const updateOutreach = async (id: string, payload: Partial<Outreach>) => {
  const { data } = await api.patch(`/outreach/${id}`, payload);
  return data;
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};
