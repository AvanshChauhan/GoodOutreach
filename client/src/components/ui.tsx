import React from 'react';
import { AlertTriangle, Inbox, CheckCircle2, XCircle, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  const getIcon = () => {
    switch (status.toLowerCase()) {
      case 'qualified':
      case 'approved':
      case 'sent':
      case 'generated':
        return <CheckCircle2 size={12} />;
      case 'rejected':
      case 'failed':
        return <XCircle size={12} />;
      case 'pending':
      case 'draft':
        return <Clock size={12} />;
      case 'simulated':
        return <Sparkles size={12} />;
      default:
        return null;
    }
  };

  return (
    <span className={`badge badge-${status.toLowerCase()} ${className}`}>
      {getIcon()}
      <span>{status}</span>
    </span>
  );
}

interface StatCardProps {
  label?: string;
  title?: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function StatCard({ label, title, value, icon, color }: StatCardProps) {
  const cardTitle = title || label || '';
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {cardTitle}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: color || 'var(--text-main)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {value}
          </p>
        </div>
        {icon && (
          <div style={{ color: 'var(--text-muted)', opacity: 0.8 }}>{icon}</div>
        )}
      </div>
    </div>
  );
}

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ size = 'md', text }: LoadingProps) {
  const sizeMap = { sm: 16, md: 24, lg: 40 };
  const px = sizeMap[size];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
      <div
        className="loading-spinner"
        style={{ width: px, height: px, color: '#000000' }}
      />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, fontWeight: 500 }}>{text}</p>}
    </div>
  );
}

interface ErrorBoxProps {
  error?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorBox({ error, message }: ErrorBoxProps) {
  return (
    <div style={{
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 12,
      padding: '12px 16px',
      color: '#dc2626',
      fontSize: 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <AlertTriangle size={16} />
      <span>{message || error || 'An error occurred'}</span>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.6 }}>
        {icon || <Inbox size={40} />}
      </div>
      <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>{title}</h3>
      {description && <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)' }}>{description}</p>}
      {action}
    </div>
  );
}

interface DemoBannerProps {
  message?: string;
}

export function DemoBanner({ message }: DemoBannerProps) {
  return (
    <div className="demo-banner">
      <AlertCircle size={16} color="#854d0e" />
      <span>
        <strong>DEMO MODE:</strong> {message || 'AI personalization is simulated. Add a GEMINI_API_KEY to enable real AI generation.'}
      </span>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen, title, message, confirmLabel = 'Confirm',
  confirmClass = 'btn-primary', onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ padding: 24, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{title}</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
