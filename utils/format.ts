export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDistance = (km: number): string => {
  if (km <= 0) return '0 m';
  const meters = Math.round(km * 1000);
  if (meters < 1000) return `${meters} m`;
  const kmRounded = Math.round(km * 10) / 10;
  return `${kmRounded.toFixed(kmRounded % 1 === 0 ? 0 : 1)} km`;
};

export const formatPace = (minPerKm: number): string => {
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

export const formatDate = (dateISO: string): string => {
  const date = new Date(dateISO);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const formatEventDate = (dateISO: string): string => {
  const date = new Date(dateISO);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays < 7) {
    return `In ${diffDays} days`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const formatEventTime = (dateISO: string): string => {
  const date = new Date(dateISO);
  // Defer formatting to device locale and settings for 12/24h preference
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

export const getRelativeTime = (dateISO: string): string => {
  const date = new Date(dateISO);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return formatDate(dateISO);
  }
};
