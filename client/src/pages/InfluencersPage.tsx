import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getInfluencers, deleteInfluencer } from '../services/api';
import { StatusBadge, Loading, ErrorBox, EmptyState, ConfirmModal } from '../components/ui';
import { formatFollowers, formatEngagement, getPlatformIcon } from '../utils/format';
import type { Influencer } from '../types';

const FILTER_OPTIONS = ['all', 'pending', 'qualified', 'rejected'];
const PLATFORM_OPTIONS = ['all', 'Instagram', 'YouTube', 'TikTok', 'Other'];

export default function InfluencersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['influencers', page, search, filterStatus, platform],
    queryFn: () =>
      getInfluencers({
        page,
        limit: 20,
        search: search || undefined,
        filterStatus: filterStatus !== 'all' ? filterStatus : undefined,
        platform: platform !== 'all' ? platform : undefined,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteInfluencer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencers'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeleteId(null);
    },
  });

  const influencers = data?.data?.influencers || [];
  const pagination = data?.data?.pagination;

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Influencers</h1>
          <p className="page-subtitle">
            {pagination ? `${pagination.total} total records` : 'Manage your influencer database'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/discovery" className="btn btn-primary">
            + Import Influencers
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div className="flex gap-3 flex-wrap items-center">
          <input
            className="input"
            style={{ maxWidth: 240 }}
            placeholder="Search name, niche, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="input"
            style={{ maxWidth: 160 }}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === 'all' ? 'All Statuses' : o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
          <select
            className="input"
            style={{ maxWidth: 160 }}
            value={platform}
            onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
          >
            {PLATFORM_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === 'all' ? 'All Platforms' : o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading && <Loading text="Loading influencers..." />}
        {error && <div style={{ padding: 20 }}><ErrorBox error={(error as Error).message} /></div>}
        {!isLoading && influencers.length === 0 && (
          <EmptyState
            icon="👥"
            title="No influencers found"
            description="Import a CSV or adjust your filters to see results."
            action={<Link to="/discovery" className="btn btn-primary">Import Influencers</Link>}
          />
        )}
        {influencers.length > 0 && (
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
                  <th>Filter</th>
                  <th>AI</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((inf: Influencer) => (
                  <tr key={inf._id}>
                    <td>
                      <Link to={`/influencers/${inf._id}`} style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none' }}>
                        {inf.name}
                      </Link>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getPlatformIcon(inf.platform)} {inf.platform}
                      </span>
                    </td>
                    <td>{formatFollowers(inf.followerCount)}</td>
                    <td>{formatEngagement(inf.engagementRate)}</td>
                    <td>
                      <span className="pill">{inf.niche}</span>
                    </td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inf.contactEmail ? (
                        <span style={{ color: '#34d399', fontSize: 12 }}>{inf.contactEmail}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Not found</span>
                      )}
                    </td>
                    <td><StatusBadge status={inf.filterStatus} /></td>
                    <td><StatusBadge status={inf.personalizationStatus} /></td>
                    <td>
                      <div className="flex gap-1">
                        <Link to={`/influencers/${inf._id}`} className="btn btn-secondary btn-sm">View</Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(inf._id)}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >← Prev</button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.pages}
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Influencer"
        message="Are you sure you want to delete this influencer? This action cannot be undone."
        confirmLabel="Delete"
        confirmClass="btn-danger"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
