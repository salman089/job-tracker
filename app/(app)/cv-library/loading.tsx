export default function CvLibraryLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-surface h-16 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
