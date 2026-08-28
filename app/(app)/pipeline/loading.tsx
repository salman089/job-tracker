const COLUMNS = 5;
const CARDS_PER_COLUMN = [2, 3, 1, 2, 1];

export default function PipelineLoading() {
  return (
    <div className="flex h-full gap-4 overflow-x-hidden p-4 md:p-6">
      {Array.from({ length: COLUMNS }).map((_, col) => (
        <div key={col} className="flex h-full w-72 shrink-0 flex-col gap-3">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          {Array.from({ length: CARDS_PER_COLUMN[col] }).map((_, card) => (
            <div key={card} className="glass-surface h-24 animate-pulse rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
