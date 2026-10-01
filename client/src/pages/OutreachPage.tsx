import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getOutreach, approveOutreach, sendOutreach, simulateOutreach } from '../services/api';
import { StatusBadge, Loading, ErrorBox, StatCard } from '../components/ui';
import { Send, FileText, CheckCircle2, Sparkles, Inbox, Eye } from 'lucide-react';

export function OutreachPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['outreach', statusFilter],
    queryFn: () => getOutreach(statusFilter),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveOutreach(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreach'] }),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => sendOutreach(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreach'] }),
  });

  const simulateMutation = useMutation({
    mutationFn: (id: string) => simulateOutreach(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outreach'] }),
  });

  if (isLoading) return <Loading text="Loading outreach workflow data..." />;
  if (isError) return <ErrorBox message={(error as Error)?.message || 'Failed to load outreach records'} onRetry={refetch} />;

  const outreachData = response?.data;
  const outreachList = outreachData?.outreach || [];
  const summary = outreachData?.summary || { total: 0, draft: 0, approved: 0, sent: 0, simulated: 0, failed: 0 };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Outreach Queue</h1>
          <p className="page-subtitle">
            Review, approve, and send AI-generated email and Instagram DM campaigns
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24, gap: 14 }}>
        <StatCard title="Total Campaigns" value={summary.total} icon={<Send size={18} />} />
        <StatCard title="Draft Stage" value={summary.draft} icon={<FileText size={18} />} />
        <StatCard title="Approved" value={summary.approved} icon={<CheckCircle2 size={18} />} />
        <StatCard title="Sent / Delivered" value={summary.sent} icon={<Send size={18} />} />
        <StatCard title="Simulated Sandbox" value={summary.simulated} icon={<Sparkles size={18} />} />
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: 12, marginBottom: 20, display: 'flex', gap: 8 }}>
        {['all', 'draft', 'approved', 'sent', 'simulated', 'failed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize', fontSize: 13, padding: '6px 16px' }}
          >
            {st} {st === 'all' ? `(${summary.total})` : `(${summary[st as keyof typeof summary] || 0})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {outreachList.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.5 }}>
            <Inbox size={40} />
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>No outreach records found</p>
          <p style={{ fontSize: 13, margin: '4px 0 16px' }}>Generate personalization for qualified influencers to populate the outreach queue.</p>
          <Link to="/influencers" className="btn btn-primary">Go to Influencers</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Influencer</th>
                <th>Platform</th>
                <th>Subject / Angle</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outreachList.map((item: any) => {
                const influencer = item.influencerId;
                return (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{influencer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {item.email || `@${influencer?.name?.toLowerCase().replace(/\s+/g, '')}`}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{influencer?.platform || 'Instagram'}</span>
                    </td>
                    <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{item.emailSubject || 'Personalized Collaboration'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {item.igDmMessage || item.emailBody?.substring(0, 50)}...
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Link to={`/influencers/${typeof influencer === 'string' ? influencer : influencer?._id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                          <Eye size={14} /> View
                        </Link>

                        {item.status === 'draft' && (
                          <button
                            onClick={() => approveMutation.mutate(item._id)}
                            disabled={approveMutation.isPending}
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', fontSize: 12 }}
                          >
                            Approve
                          </button>
                        )}

                        {item.status === 'approved' && (
                          <>
                            <button
                              onClick={() => sendMutation.mutate(item._id)}
                              disabled={sendMutation.isPending}
                              className="btn btn-primary"
                              style={{ padding: '6px 14px', fontSize: 12 }}
                            >
                              Send Email
                            </button>
                            <button
                              onClick={() => simulateMutation.mutate(item._id)}
                              disabled={simulateMutation.isPending}
                              className="btn btn-secondary"
                              style={{ padding: '6px 14px', fontSize: 12 }}
                            >
                              Simulate DM
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
