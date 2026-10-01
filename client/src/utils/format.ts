export function formatFollowers(n: number | null): string {
  if (n === null) return 'N/A';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatEngagement(n: number | null): string {
  if (n === null) return 'N/A';
  return `${n.toFixed(1)}%`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

export function getPlatformIcon(platform: string): string {
  switch (platform) {
    case 'Instagram': return '📸';
    case 'YouTube': return '▶️';
    case 'TikTok': return '🎵';
    default: return '🌐';
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'Instagram': return '#e1306c';
    case 'YouTube': return '#ff0000';
    case 'TikTok': return '#69c9d0';
    default: return '#64748b';
  }
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
