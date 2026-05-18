export function formatScore(score) {
  if (score === null || score === undefined) return '--';
  return `${Math.round(score)}`;
}

export function formatDate(value) {
  if (!value) return '--';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = String(total % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function scoreTone(score) {
  if (score >= 82) return 'text-emerald-300';
  if (score >= 65) return 'text-amber-300';
  return 'text-rose-300';
}

export const domains = ['Software Engineering', 'AI/ML', 'Data Science', 'Web Development', 'Cloud/DevOps'];
