export function SkeletonLoader({ rows = 6 }) {
  return (
    <div className="space-y-3 p-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}
