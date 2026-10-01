import { useState, useRef } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { importInfluencers, createInfluencer } from '../services/api';
import { ErrorBox } from '../components/ui';
import type { ImportSummary, Platform } from '../types';
import { Upload, Plus, CheckCircle2, User, ArrowRight } from 'lucide-react';

export default function DiscoveryPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'csv'>('form');
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Manual discovery form state
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Instagram' as Platform,
    profileUrl: '',
    followerCount: '',
    engagementRate: '',
    niche: 'Beauty & Skincare',
    contactEmail: '',
    contentDescription: '',
  });

  const importMut = useMutation({
    mutationFn: importInfluencers,
    onSuccess: (res) => {
      setResult(res.data || null);
      qc.invalidateQueries({ queryKey: ['influencers'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const createMut = useMutation({
    mutationFn: createInfluencer,
    onSuccess: () => {
      setFormSuccess(true);
      setFormData({
        name: '',
        platform: 'Instagram',
        profileUrl: '',
        followerCount: '',
        engagementRate: '',
        niche: 'Beauty & Skincare',
        contactEmail: '',
        contentDescription: '',
      });
      qc.invalidateQueries({ queryKey: ['influencers'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setTimeout(() => setFormSuccess(false), 4000);
    },
  });

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }
    importMut.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.profileUrl) {
      alert('Please provide at least a name and profile URL.');
      return;
    }
    createMut.mutate({
      name: formData.name,
      platform: formData.platform,
      profileUrl: formData.profileUrl,
      niche: formData.niche,
      followerCount: formData.followerCount ? Number(formData.followerCount) : null,
      engagementRate: formData.engagementRate ? Number(formData.engagementRate) : null,
      contactEmail: formData.contactEmail || null,
      contentDescription: formData.contentDescription || null,
      contentThemes: [formData.niche],
      source: 'manual_discovery',
      filterStatus: 'pending',
      enrichmentStatus: 'pending',
      personalizationStatus: 'pending',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Influencer Discovery</h1>
          <p className="page-subtitle">Discover micro-influencers via manual form entry or batch CSV import</p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('form')}
          className={`btn ${activeTab === 'form' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 20px', borderRadius: 9999 }}
        >
          <Plus size={16} /> Manual Discovery Form
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          className={`btn ${activeTab === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 20px', borderRadius: 9999 }}
        >
          <Upload size={16} /> Batch CSV Import
        </button>
      </div>

      {/* TAB 1: MANUAL DISCOVERY FORM */}
      {activeTab === 'form' && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="var(--text-muted)" /> Add New Influencer Profile
            </h2>

            {formSuccess && (
              <div style={{
                padding: '12px 16px', borderRadius: 12, background: '#dcfce7', border: '1px solid #bbf7d0',
                color: '#15803d', fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <CheckCircle2 size={16} /> Influencer discovered & added to pending qualification roster!
              </div>
            )}

            {createMut.isError && <ErrorBox message={(createMut.error as Error).message} />}

            <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Influencer / Creator Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Platform *
                  </label>
                  <select
                    className="input"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Profile URL *
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://instagram.com/sarahjenkins_beauty"
                  value={formData.profileUrl}
                  onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Follower Count
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 25000"
                    value={formData.followerCount}
                    onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Engagement Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    placeholder="e.g. 3.8"
                    value={formData.engagementRate}
                    onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Niche / Category
                  </label>
                  <select
                    className="input"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  >
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Fitness & Wellness">Fitness & Wellness</option>
                    <option value="Fashion & Style">Fashion & Style</option>
                    <option value="Tech & Gaming">Tech & Gaming</option>
                    <option value="Travel & Lifestyle">Travel & Lifestyle</option>
                    <option value="Food & Cooking">Food & Cooking</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="collabs@sarahjenkins.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Content Description / Bio
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Creates daily clean beauty skincare routines and product reviews..."
                  value={formData.contentDescription}
                  onChange={(e) => setFormData({ ...formData, contentDescription: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMut.isPending}
                style={{ padding: '12px 24px', fontSize: 14, width: 'fit-content', marginTop: 8 }}
              >
                {createMut.isPending ? <><span className="loading-spinner" /> Discovering...</> : <>Discover & Add Profile <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Discovery Guidelines</h3>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Profiles added via discovery enter the <strong>pending qualification queue</strong>.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Minimum recommended followers: 10,000</li>
                <li>Target engagement rate: ≥ 2.5%</li>
                <li>Ensure accurate profile URL for AI personalization</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH CSV IMPORT */}
      {activeTab === 'csv' && (
        <div>
          {/* Drop zone */}
          <div
            className="card"
            style={{
              border: `2px dashed ${dragOver ? '#000000' : 'var(--border)'}`,
              background: dragOver ? 'rgba(200,243,50,0.1)' : undefined,
              textAlign: 'center',
              padding: 48,
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginBottom: 20,
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--text-muted)' }}>
              <Upload size={40} />
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
              {importMut.isPending ? 'Importing CSV file...' : 'Drop CSV file here or click to browse'}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Max file size: 10MB · Accepts standard .csv files
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {importMut.isPending && (
              <div style={{ marginTop: 16 }}>
                <span className="loading-spinner" style={{ color: '#000000', width: 24, height: 24 }} />
              </div>
            )}
          </div>

          {importMut.isError && <ErrorBox message={(importMut.error as Error).message} />}

          {/* Import result */}
          {result && (
            <div className="card">
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Import Execution Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Total Rows', value: result.total, color: 'var(--text-main)' },
                  { label: 'Imported', value: result.imported, color: '#15803d' },
                  { label: 'Duplicates', value: result.duplicates, color: '#b45309' },
                  { label: 'Invalid', value: result.invalid, color: '#dc2626' },
                  { label: 'Skipped', value: result.skipped, color: '#71717a' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: '#fafafa', borderRadius: 12, padding: '14px 16px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color }}>{value}</p>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>

              {result.errors.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Row Validation Logs ({result.errors.length})
                  </p>
                  <div style={{ maxHeight: 200, overflowY: 'auto', background: '#fafafa', borderRadius: 12, border: '1px solid var(--border)' }}>
                    {result.errors.map((e, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderBottom: i < result.errors.length - 1 ? '1px solid var(--border)' : undefined, fontSize: 12 }}>
                        <span style={{ color: '#b45309', fontWeight: 700 }}>Row {e.row}:</span>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>{e.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
