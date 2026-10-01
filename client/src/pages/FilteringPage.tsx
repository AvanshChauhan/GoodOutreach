import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runFilter, getFilterResults, runEnrichment } from '../services/api';
import { StatusBadge, Loading, ErrorBox } from '../components/ui';
import { formatFollowers, formatEngagement, getPlatformIcon } from '../utils/format';
import type { FilterConfig, Influencer } from '../types';

const DEFAULT_CONFIG: FilterConfig = {
  niche: 'fitness',
  minFollowers: 5000,
  maxFollowers: 100000,
  minEngagementRate: 2,
  requiredPlatforms: ['Instagram', 'YouTube', 'TikTok'],
  requireEmail: true,
  reset: true,
};

const PLATFORM_OPTIONS = ['Instagram', 'YouTube', 'TikTok', 'Other'] as const;

export default function FilteringPage() {
  const qc = useQueryClient();
  const [config, setConfig] = useState<FilterConfig>(DEFAULT_CONFIG);
  const [filterMsg, setFilterMsg] = useState<string | null>(null);

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['filter-results'],
    queryFn: getFilterResults,
  });

  const filterMut = useMutation({
    mutationFn: runFilter,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['filter-results'] });
      qc.invalidateQueries({ queryKey: ['influencers'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      const d = res.data;
      if (d) setFilterMsg(
        `Run complete: ${d.processed} processed → ${d.qualified} qualified, ${d.rejected} rejected` +
        (d.errors > 0 ? `, ${d.errors} errors` : '')
      );
    },
  });

  const enrichMut = useMutation({
    mutationFn: runEnrichment,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['influencers'] });
      alert(`Enrichment complete: ${res.data?.completed} completed, ${res.data?.partial} partial, ${res.data?.errors} errors`);
    },
  });

  const togglePlatform = (p: typeof PLATFORM_OPTIONS[number]) => {
    setConfig((c) => ({
      ...c,
      requiredPlatforms: c.requiredPlatforms.includes(p)
        ? c.requiredPlatforms.filter((x) => x !== p)
        : [...c.requiredPlatforms, p],
    }));
  };

  const results = resultsData?.data;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Filtering Engine</h1>
        <p className="page-subtitle">Configure criteria and run the filter against your influencer database</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Config panel */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>Filter Configuration</h3>

            <div style={{ marginBottom: 14 }}>
              <label>Niche</label>
              <input className="input" value={config.niche} onChange={(e) => setConfig((c) => ({ ...c, niche: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label>Min Followers</label>
                <input className="input" type="number" value={config.minFollowers} onChange={(e) => setConfig((c) => ({ ...c, minFollowers: +e.target.value }))} />
              </div>
              <div>
                <label>Max Followers</label>
                <input className="input" type="number" value={config.maxFollowers} onChange={(e) => setConfig((c) => ({ ...c, maxFollowers: +e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>Min Engagement Rate (%)</label>
              <input className="input" type="number" step="0.1" value={config.minEngagementRate} onChange={(e) => setConfig((c) => ({ ...c, minEngagementRate: +e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label>Required Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${config.requiredPlatforms.includes(p) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => togglePlatform(p)}
                    type="button"
                  >
                    {getPlatformIcon(p)} {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.requireEmail}
                  onChange={(e) => setConfig((c) => ({ ...c, requireEmail: e.target.checked }))}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Require Contact Email</span>
              </label>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.reset}
                  onChange={(e) => setConfig((c) => ({ ...c, reset: e.target.checked }))}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Reset all statuses before running</span>
              </label>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => filterMut.mutate(config)}
              disabled={filterMut.isPending}
            >
              {filterMut.isPending ? <><span className="loading-spinner" /> Running Filter...</> : '⚡ Run Filter'}
            </button>

            {filterMut.isError && (
              <div style={{ marginTop: 8 }}>
                <ErrorBox error={(filterMut.error as Error).message} />
              </div>
            )}
            {filterMsg && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, fontSize: 12, color: '#34d399' }}>
                ✓ {filterMsg}
              </div>
            )}
          </div>

          {/* Enrichment */}
          <div className="card">
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Enrichment</h3>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>
              Run enrichment on all qualified influencers to validate data quality.
            </p>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => enrichMut.mutate()}
              disabled={enrichMut.isPending}
            >
              {enrichMut.isPending ? <><span className="loading-spinner" /> Running...</> : '🔍 Run Enrichment'}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div>
          {/* Summary cards */}
          {results && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Total', value: results.summary.total, color: 'var(--text-primary)' },
                { label: 'Qualified', value: results.summary.qualified, color: '#34d399' },
                { label: 'Rejected', value: results.summary.rejected, color: '#f87171' },
                { label: 'Pending', value: results.summary.pending, color: '#94a3b8' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color }}>{value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Results table */}
          <div className="card" style={{ padding: 0 }}>
            {resultsLoading && <Loading text="Loading results..." />}
            {results && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Platform</th>
                      <th>Followers</th>
                      <th>Engagement</th>
                      <th>Niche</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Reason / Pass Criteria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...results.qualified, ...results.rejected, ...results.pending].map((inf: Influencer) => (
                      <tr key={inf._id}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inf.name}</td>
                        <td>{getPlatformIcon(inf.platform)} {inf.platform}</td>
                        <td>{formatFollowers(inf.followerCount)}</td>
                        <td>{formatEngagement(inf.engagementRate)}</td>
                        <td><span className="pill">{inf.niche}</span></td>
                        <td>
                          {inf.contactEmail
                            ? <span style={{ color: '#34d399', fontSize: 11 }}>✓ Available</span>
                            : <span style={{ color: '#f87171', fontSize: 11 }}>✗ Not found</span>
                          }
                        </td>
                        <td><StatusBadge status={inf.filterStatus} /></td>
                        <td style={{ maxWidth: 280, fontSize: 11, color: inf.filterStatus === 'rejected' ? '#f87171' : '#34d399' }}>
                          {inf.filterStatus === 'rejected'
                            ? inf.rejectionReason
                            : inf.filterStatus === 'qualified'
                            ? '✓ All criteria passed'
                            : '—'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
