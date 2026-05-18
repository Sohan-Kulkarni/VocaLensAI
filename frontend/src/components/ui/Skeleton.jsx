export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.08] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
