import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, runFilter, bulkGenerate } from '../services/api';
import { Loading, ErrorBox } from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, Users, Send, CheckCircle2, Award, Zap, Play, Sparkles, Plus, RefreshCw } from 'lucide-react';

const LIME_COLOR = '#c8f332';
const TEAL_COLOR = '#00c9a7';

export default function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const filterMut = useMutation({
    mutationFn: () => runFilter({
      niche: 'all',
      minFollowers: 10000,
      maxFollowers: 100000,
      minEngagementRate: 2.5,
      requiredPlatforms: ['Instagram', 'YouTube', 'TikTok'],
      requireEmail: false,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['influencers'] });
      setActionSuccess(`Qualification engine executed: ${res.data?.qualified || 0} qualified, ${res.data?.rejected || 0} rejected.`);
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const bulkGenMut = useMutation({
    mutationFn: bulkGenerate,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['outreach'] });
      setActionSuccess(`Batch AI Personalization completed for ${res.data?.generated || 0} influencers.`);
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  if (isLoading) return <Loading text="Loading GoodBoard outreach analytics..." />;
  if (isError) return <ErrorBox message={(error as Error)?.message || 'Failed to load dashboard statistics'} onRetry={refetch} />;

  const stats = response?.data;
  const influencers = stats?.influencers || { total: 0, qualified: 0, rejected: 0, pending: 0 };
  const outreach = stats?.outreach || { total: 0, sent: 0, simulated: 0, failed: 0, byStatus: [] };
  const charts = stats?.charts || { byPlatform: [], byNiche: [], filterStatus: [] };

  const totalInfluencers = influencers.total || 0;
  const qualifiedCount = influencers.qualified || 0;
  const sentCount = (outreach.sent || 0) + (outreach.simulated || 0);
  const qualRatio = totalInfluencers > 0 ? Math.round((qualifiedCount / totalInfluencers) * 100) : 0;

  // Monthly trend mock curve scaled dynamically
  const monthlyTrendData = [
    { month: 'Jan', discovered: Math.round(totalInfluencers * 0.15), contacted: Math.round(sentCount * 0.1) },
    { month: 'Feb', discovered: Math.round(totalInfluencers * 0.25), contacted: Math.round(sentCount * 0.25) },
    { month: 'Mar', discovered: Math.round(totalInfluencers * 0.45), contacted: Math.round(sentCount * 0.45) },
    { month: 'Apr', discovered: Math.round(totalInfluencers * 0.65), contacted: Math.round(sentCount * 0.65) },
    { month: 'May', discovered: Math.round(totalInfluencers * 0.85), contacted: Math.round(sentCount * 0.85) },
    { month: 'June', discovered: totalInfluencers, contacted: sentCount },
  ];

  const nicheList = charts.byNiche.length > 0 ? charts.byNiche : [
    { niche: 'Beauty & Skincare', count: Math.round(totalInfluencers * 0.35) },
    { niche: 'Fitness & Wellness', count: Math.round(totalInfluencers * 0.28) },
    { niche: 'Fashion & Style', count: Math.round(totalInfluencers * 0.22) },
    { niche: 'Tech & Gaming', count: Math.round(totalInfluencers * 0.15) },
  ];

  const platformList = charts.byPlatform.length > 0 ? charts.byPlatform : [
    { platform: 'Instagram', count: Math.round(totalInfluencers * 0.45) },
    { platform: 'YouTube', count: Math.round(totalInfluencers * 0.30) },
    { platform: 'TikTok', count: Math.round(totalInfluencers * 0.15) },
    { platform: 'Other', count: Math.round(totalInfluencers * 0.10) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title & Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Influencer Outreach Dashboard</h1>
          <p className="page-subtitle">Real-time dynamic qualification, enrichment, and AI outreach analytics</p>
        </div>

        <div style={{ display: 'flex', gap: 8, background: '#ffffff', padding: 4, borderRadius: 9999, border: '1px solid var(--border)' }}>
          {(['7d', '30d', '90d', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`btn btn-sm ${timeframe === t ? 'btn-dark' : 'btn-ghost'}`}
              style={{ borderRadius: 9999, padding: '5px 14px', textTransform: 'uppercase', fontSize: 11 }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS TOOLBAR (Functional Engine Launchers) */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={18} color="var(--lime-text)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Interactive Engine Actions:</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => filterMut.mutate()}
            disabled={filterMut.isPending}
          >
            {filterMut.isPending ? <><span className="loading-spinner" /> Filtering...</> : <><Play size={14} /> Run Qualification Engine</>}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => bulkGenMut.mutate()}
            disabled={bulkGenMut.isPending}
          >
            {bulkGenMut.isPending ? <><span className="loading-spinner" /> Generating...</> : <><Sparkles size={14} /> Batch AI Personalization</>}
          </button>

          <button
            className="btn btn-dark"
            onClick={() => navigate('/discovery')}
          >
            <Plus size={14} /> Discover Influencers
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => refetch()}
            title="Refresh statistics"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, background: '#dcfce7', border: '1px solid #bbf7d0',
          color: '#15803d', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* TOP ROW: 3 Clickable Black KPI Cards + Volume Level Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* 3 Interactive Black KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {/* Card 1 */}
          <div
            className="stat-card-black"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/influencers')}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 600 }}>Total Influencers</span>
              <Users size={18} color="var(--lime-primary)" />
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {totalInfluencers}
              </div>
              <div className="trend-badge">
                <TrendingUp size={12} /> Click to view list
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="stat-card-black"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/influencers?filterStatus=qualified')}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 600 }}>Qualified Micro</span>
              <CheckCircle2 size={18} color="var(--lime-primary)" />
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {qualifiedCount}
              </div>
              <div className="trend-badge">
                <TrendingUp size={12} /> {qualRatio}% pass rate
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="stat-card-black"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/outreach')}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 600 }}>AI Outreach Sent</span>
              <Send size={18} color="var(--lime-primary)" />
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {sentCount}
              </div>
              <div className="trend-badge">
                <TrendingUp size={12} /> View outreach queue
              </div>
            </div>
          </div>
        </div>

        {/* Qualification & Volume Level Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Volume Qualification Level</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalInfluencers} Discovered</span>
          </div>
          <div style={{ height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformList}>
                <XAxis dataKey="platform" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill={TEAL_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: Bright Lime Satisfaction Card + Monthly Line Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
        {/* Bright Lime Feature Card matching GoodBoard 'Buyer Satisfaction' */}
        <div className="card" style={{ background: 'var(--lime-primary)', color: '#000000', border: 'none' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Qualification Rate</h3>
            <Zap size={20} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>
            {qualRatio}%
            <span style={{ fontSize: 13, fontWeight: 600, display: 'block', opacity: 0.8 }}>Qualified Micro-Influencers ratio</span>
          </div>
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.filterStatus.length > 0 ? charts.filterStatus : [
                { status: 'Qualified', count: qualifiedCount },
                { status: 'Pending', count: influencers.pending },
                { status: 'Rejected', count: influencers.rejected },
              ]}>
                <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Outreach Curve Line Chart */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Outreach Growth Trend</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Discovered vs Contacted influencers over time</p>
            </div>
            <span className="badge badge-qualified">{sentCount} Active Campaigns</span>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="discovered" stroke="#00c9a7" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="contacted" stroke="#84cc16" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Top Niches Table + Platform Share */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Top Niches Table */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Top Influencer Niches</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>By Popularity</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Niche Name</th>
                <th>Popularity</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {nicheList.slice(0, 4).map((item: { niche?: string; name?: string; count: number }, idx: number) => {
                const nicheName = item.niche || item.name || `Category ${idx + 1}`;
                const pct = totalInfluencers > 0 ? Math.round((item.count / totalInfluencers) * 100) : 25;
                return (
                  <tr key={nicheName}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>0{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{nicheName}</td>
                    <td style={{ width: '45%' }}>
                      <div style={{ height: 8, background: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, pct)}%`,
                          background: idx === 0 ? LIME_COLOR : TEAL_COLOR,
                          borderRadius: 9999,
                        }} />
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ background: '#f4f4f5', color: '#000', fontWeight: 800 }}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Platform Share Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Platform Breakdown</h3>
            <Award size={18} color="var(--text-muted)" />
          </div>
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformList} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="platform" axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill={LIME_COLOR} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
