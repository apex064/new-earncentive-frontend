export const fixImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('rebackend-ij74.onrender.com')) return url.replace(/^http:/, 'https:');
  if (url.startsWith('/media/')) return `https://rebackend-ij74.onrender.com${url}`;
  return url.replace(/^http:/, 'https:');
};

export const getLevelColor = (level: string) => {
  switch (level) {
    case 'Gold': return 'bg-secondary/20 text-secondary border-primary/30';
    case 'Silver': return 'bg-primary/40/20 text-muted-foreground border-border/30';
    case 'Bronze': return 'bg-warning-dark/20 text-yellow-600 border-yellow-600/30';
    default: return 'bg-card/50 text-primary-light/65';
  }
};

export const getLevelGradientColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'diamond': return 'from-primary-light to-primary';
    case 'platinum': return 'from-gray-300 to-gray-500';
    case 'gold': return 'from-yellow-400 to-yellow-600';
    case 'silver': return 'from-gray-400 to-gray-600';
    case 'bronze': return 'from-yellow-700 to-yellow-900';
    default: return 'from-primary-light to-primary';
  }
};

export const getLevelIcon = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'diamond': return 'Crown';
    case 'platinum': return 'Trophy';
    case 'gold': return 'Star';
    case 'silver': return 'Star';
    case 'bronze': return 'Star';
    default: return 'UserIcon';
  }
};

export const formatJoinDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};