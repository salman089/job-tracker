export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-surface h-20 animate-pulse rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-surface h-48 animate-pulse rounded-2xl lg:col-span-2" />
        <div className="glass-surface h-48 animate-pulse rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-surface h-40 animate-pulse rounded-2xl lg:col-span-2" />
        <div className="glass-surface h-40 animate-pulse rounded-2xl" />
      </div>
    </div>
  );
}
