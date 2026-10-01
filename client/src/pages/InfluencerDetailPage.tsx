import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInfluencerById, generatePersonalization, regeneratePersonalization,
  approveOutreach, simulateOutreach, getOutreach, updateInfluencer, updateOutreach
} from '../services/api';
import { StatusBadge, Loading, ErrorBox, DemoBanner } from '../components/ui';
import { formatFollowers, formatEngagement, getPlatformIcon, wordCount } from '../utils/format';
import type { Outreach } from '../types';
import { Sparkles, RefreshCw, CheckCircle2, Send, Save, ArrowLeft, Lightbulb, Edit3, MessageSquare, Mail, Zap } from 'lucide-react';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</p>
      <div style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{value ?? 'Not available'}</div>
    </div>
  );
}

export default function InfluencerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isDemo, setIsDemo] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state for inline editing
  const [editSubject, setEditSubject] = useState('');
  const [editEmailBody, setEditEmailBody] = useState('');
  const [editDM, setEditDM] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: infData, isLoading, error } = useQuery({
    queryKey: ['influencer', id],
    queryFn: () => getInfluencerById(id!),
    enabled: !!id,
  });

  const { data: outreachData } = useQuery({
    queryKey: ['outreach-for-influencer', id],
    queryFn: async () => {
      const res = await getOutreach();
      const all = res.data?.outreach || [];
      return all.find((o: Outreach) =>
        typeof o.influencerId === 'string' ? o.influencerId === id : (o.influencerId as any)._id === id
      );
    },
    enabled: !!id,
  });

  // Sync edit form state when outreachData loads
  useEffect(() => {
    if (outreachData) {
      setEditSubject(outreachData.emailSubject || '');
      setEditEmailBody(outreachData.emailMessage || '');
      setEditDM(outreachData.instagramDM || '');
    }
  }, [outreachData]);

  const generateMut = useMutation({
    mutationFn: () => generatePersonalization(id!),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['influencer', id] });
      qc.invalidateQueries({ queryKey: ['outreach-for-influencer', id] });
      setIsDemo(!res.data?.provider?.includes('Gemini'));
    },
  });

  const regenMut = useMutation({
    mutationFn: () => regeneratePersonalization(id!),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['influencer', id] });
      qc.invalidateQueries({ queryKey: ['outreach-for-influencer', id] });
      setIsDemo(!res.data?.provider?.includes('Gemini'));
    },
  });

  const approveMut = useMutation({
    mutationFn: () => approveOutreach(outreachData?._id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outreach-for-influencer', id] }),
  });

  const simulateMut = useMutation({
    mutationFn: () => simulateOutreach(outreachData?._id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outreach-for-influencer', id] }),
  });

  const updateOutreachMut = useMutation({
    mutationFn: () => updateOutreach(outreachData?._id!, {
      emailSubject: editSubject,
      emailMessage: editEmailBody,
      instagramDM: editDM,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-for-influencer', id] });
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  if (isLoading) return <Loading text="Loading influencer profile..." />;
  if (error) return <ErrorBox error={(error as Error).message} />;

  const inf = infData?.data;
  if (!inf) return null;

  const outreach: Outreach | undefined = outreachData;

  const currentEmailBody = editing ? editEmailBody : (outreach?.emailMessage || '');
  const currentDM = editing ? editDM : (outreach?.instagramDM || '');
  const emailWordCount = wordCount(currentEmailBody);
  const dmWordCount = wordCount(currentDM);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{inf.name}</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>{getPlatformIcon(inf.platform)} {inf.platform} · {inf.niche}</p>
          </div>
        </div>
        <StatusBadge status={inf.filterStatus} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Profile Details */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Influencer Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="Name" value={inf.name} />
            <Field label="Platform" value={`${getPlatformIcon(inf.platform)} ${inf.platform}`} />
            <Field label="Followers" value={formatFollowers(inf.followerCount)} />
            <Field label="Engagement Rate" value={formatEngagement(inf.engagementRate)} />
            <Field label="Niche" value={inf.niche} />
            <Field label="Contact Email" value={inf.contactEmail} />
            <Field label="Website" value={inf.website} />
            <Field label="Source" value={inf.source} />
          </div>
          <Field label="Profile URL" value={
            inf.profileUrl && (
              <a href={inf.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: 13, fontWeight: 600 }}>
                {inf.profileUrl}
              </a>
            )
          } />
        </div>

        {/* Audience & Content Themes */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Audience & Content Themes</h3>
          <Field label="Audience Age" value={inf.audienceAge} />
          <Field label="Audience Gender" value={inf.audienceGender} />
          <Field label="Audience Geography" value={inf.audienceGeography} />
          {inf.contentThemes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Content Themes</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {inf.contentThemes.map((t) => <span key={t} className="pill">{t}</span>)}
              </div>
            </div>
          )}
          <Field label="Content Description" value={inf.contentDescription} />
        </div>
      </div>

      {/* AI Personalization & Message Generator */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} color="var(--lime-text)" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>AI Dynamic Outreach Generator</h3>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {inf.filterStatus !== 'qualified' && (
              <button
                className="btn btn-success btn-sm"
                onClick={async () => {
                  await updateInfluencer(id!, { filterStatus: 'qualified' });
                  qc.invalidateQueries({ queryKey: ['influencer', id] });
                }}
              >
                <Zap size={14} /> Qualify Profile
              </button>
            )}

            {inf.personalizationStatus !== 'generated' && (
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (inf.filterStatus !== 'qualified') {
                    await updateInfluencer(id!, { filterStatus: 'qualified' });
                    qc.invalidateQueries({ queryKey: ['influencer', id] });
                  }
                  generateMut.mutate();
                }}
                disabled={generateMut.isPending}
              >
                {generateMut.isPending ? <><span className="loading-spinner" /> Generating...</> : <><Sparkles size={16} /> Generate Dynamic Messages</>}
              </button>
            )}

            {inf.personalizationStatus === 'generated' && (
              <>
                {!editing ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                    <Edit3 size={14} /> Edit Draft
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => updateOutreachMut.mutate()} disabled={updateOutreachMut.isPending}>
                    <Save size={14} /> Save Draft Edits
                  </button>
                )}

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => regenMut.mutate()}
                  disabled={regenMut.isPending}
                >
                  {regenMut.isPending ? <><span className="loading-spinner" /> Regenerating...</> : <><RefreshCw size={14} /> Regenerate Fresh Angle</>}
                </button>
              </>
            )}
          </div>
        </div>

        {isDemo && <div style={{ marginBottom: 16 }}><DemoBanner /></div>}
        {saveSuccess && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} /> Draft edits saved successfully!
          </div>
        )}

        {generateMut.isError && <ErrorBox error={(generateMut.error as Error).message} />}

        {inf.personalizationStatus !== 'generated' && !generateMut.isPending && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Sparkles size={32} style={{ opacity: 0.5, marginBottom: 12 }} />
            <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>No outreach message generated yet</p>
            <p style={{ margin: 0, fontSize: 13 }}>Click <strong>"Generate Dynamic Messages"</strong> above to craft personalized Email & Instagram DM copy.</p>
          </div>
        )}

        {outreach && (
          <div>
            {/* Dynamic Suggestions & Personalization Signals Card */}
            <div style={{ background: '#fafafa', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Lightbulb size={16} color="#b45309" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Smart Outreach Suggestions & Signals
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {outreach.personalizationSignals?.map((s) => (
                  <span key={s} className="signal-tag">{s}</span>
                ))}
                <span className="pill" style={{ background: 'var(--lime-primary)', color: '#000', fontWeight: 700 }}>
                  Recommended Format: 60s Instagram Reel + Story
                </span>
              </div>
            </div>

            {/* Email & DM Input / Preview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Email Column */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} color="var(--text-muted)" />
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Email Copy</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: emailWordCount >= 50 && emailWordCount <= 95 ? '#15803d' : '#dc2626' }}>
                    {emailWordCount} words {emailWordCount >= 50 && emailWordCount <= 95 ? '✓' : '(target: 60–90)'}
                  </span>
                </div>

                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      type="text"
                      className="input"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Email Subject Line"
                    />
                    <textarea
                      className="input"
                      rows={8}
                      value={editEmailBody}
                      onChange={(e) => setEditEmailBody(e.target.value)}
                      style={{ lineHeight: 1.6, resize: 'vertical' }}
                    />
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 13, color: '#2563eb', fontWeight: 700 }}>
                      Subject: {outreach.emailSubject}
                    </p>
                    <div style={{
                      background: '#fafafa',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 13,
                      whiteSpace: 'pre-wrap',
                      color: 'var(--text-main)',
                      lineHeight: 1.6,
                      border: '1px solid var(--border)',
                    }}>
                      {outreach.emailMessage}
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram DM Column */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={14} color="var(--text-muted)" />
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Instagram DM Copy</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: dmWordCount >= 10 && dmWordCount <= 35 ? '#15803d' : '#dc2626' }}>
                    {dmWordCount} words {dmWordCount >= 10 && dmWordCount <= 35 ? '✓' : '(target: 15–30)'}
                  </span>
                </div>

                {editing ? (
                  <textarea
                    className="input"
                    rows={10}
                    value={editDM}
                    onChange={(e) => setEditDM(e.target.value)}
                    style={{ lineHeight: 1.6, resize: 'vertical' }}
                  />
                ) : (
                  <div style={{
                    background: '#fafafa',
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-main)',
                    lineHeight: 1.6,
                    border: '1px solid var(--border)',
                  }}>
                    {outreach.instagramDM}
                  </div>
                )}
              </div>
            </div>

            {/* Outreach Action Toolbar */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Workflow Status:</span>
                <StatusBadge status={outreach.status} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {outreach.status === 'draft' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => approveMut.mutate()}
                    disabled={approveMut.isPending}
                  >
                    <CheckCircle2 size={16} /> Approve Outreach Draft
                  </button>
                )}

                {outreach.status === 'approved' && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => simulateMut.mutate()}
                      disabled={simulateMut.isPending}
                    >
                      <Send size={16} /> Send Email / DM
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
