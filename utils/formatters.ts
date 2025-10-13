export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '0 m';
  if (meters >= 1000) {
    const km = meters / 1000;
    const rounded = Math.round(km * 100) / 100; // 2dp
    return `${rounded.toFixed(rounded % 1 === 0 ? 0 : rounded % 0.1 === 0 ? 1 : 2)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0 min';
  const minutes = Math.round(totalSeconds / 60);
  return `${minutes} min`;
}

export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '–';
  const minutes = Math.floor(secPerKm / 60);
  const seconds = Math.round(secPerKm % 60);
  const sec = seconds.toString().padStart(2, '0');
  return `${minutes}:${sec}/km`;
}

