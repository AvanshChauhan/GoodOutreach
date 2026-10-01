import { useState } from 'react';
import { Building2, Target, Cpu, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [brandName, setBrandName] = useState('GlowBeauty Co.');
  const [productDesc, setProductDesc] = useState('Organic Hydrating Face Serum with Vitamin C & Hyaluronic Acid');
  const [offerDetails, setOfferDetails] = useState('Complimentary product bundle + $200 sponsored reel budget');
  const [minFollowers, setMinFollowers] = useState(10000);
  const [maxFollowers, setMaxFollowers] = useState(100000);
  const [minEngagement, setMinEngagement] = useState(2.5);
  const [tone, setTone] = useState('Professional yet warm & conversational');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: 840 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">
          Configure AI personalization parameters, qualification rules, and brand defaults
        </p>
      </div>

      {saved && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, background: '#dcfce7', border: '1px solid #bbf7d0',
          color: '#15803d', fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <CheckCircle2 size={16} /> Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Brand Profile */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={18} color="var(--text-muted)" /> Brand Collaboration Profile
          </h2>

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Brand Name</label>
              <input
                type="text"
                className="input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Product / Campaign Description</label>
              <textarea
                className="input"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Default Offer / Incentive Details</label>
              <input
                type="text"
                className="input"
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Qualification Rules */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Target size={18} color="var(--text-muted)" /> Qualification Thresholds
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Min Followers</label>
              <input
                type="number"
                className="input"
                value={minFollowers}
                onChange={(e) => setMinFollowers(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Max Followers</label>
              <input
                type="number"
                className="input"
                value={maxFollowers}
                onChange={(e) => setMaxFollowers(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Min Engagement (%)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={minEngagement}
                onChange={(e) => setMinEngagement(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* AI LLM Settings */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={18} color="var(--text-muted)" /> Gemini LLM Personalization
          </h2>

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Outreach Tone & Style</label>
              <input
                type="text"
                className="input"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 32, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email Max Length</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 14 }}>&lt; 150 words</p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Instagram DM Max Length</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 14 }}>&lt; 60 words</p>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active AI Engine</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 14, color: '#2563eb' }}>Google Gemini 1.5 Flash</p>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
}
