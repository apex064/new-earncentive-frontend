export const fixImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('rebackend-ij74.onrender.com')) return url.replace(/^http:/, 'https:');
  if (url.startsWith('/media/')) return `https://rebackend-ij74.onrender.com${url}`;
  return url.replace(/^http:/, 'https:');
};

export const secureMediaUrl = (url: string | null) => url?.replace(/^http:/, 'https:') || null;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatMessageTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateHeader = (dateString: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(dateString);

  if (messageDate.toDateString() === today.toDateString()) return 'Today';
  if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return messageDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const groupMessagesByDate = (messages: any[]) => {
  const groups: { [key: string]: any[] } = {};
  messages.forEach((msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  Object.keys(groups).forEach((date) => {
    groups[date].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });
  return groups;
};
