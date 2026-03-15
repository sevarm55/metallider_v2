export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Breadcrumbs skeleton */}
      <div className="animate-pulse flex items-center gap-2 mb-6">
        <div className="h-4 w-16 rounded bg-neutral-200" />
        <div className="h-4 w-2 rounded bg-neutral-200" />
        <div className="h-4 w-16 rounded bg-neutral-200" />
        <div className="h-4 w-2 rounded bg-neutral-200" />
        <div className="h-4 w-32 rounded bg-neutral-200" />
      </div>

      {/* Header skeleton */}
      <div className="animate-pulse mb-10">
        <div className="h-4 w-24 rounded bg-neutral-200 mb-3" />
        <div className="h-10 w-72 rounded bg-neutral-200 mb-2" />
        <div className="h-4 w-28 rounded bg-neutral-200" />
      </div>

      {/* Subcategory tabs skeleton */}
      <div className="animate-pulse flex gap-3 mb-8 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 w-40 shrink-0 rounded-2xl bg-neutral-200" />
        ))}
      </div>

      {/* View toggle + sort skeleton */}
      <div className="animate-pulse flex items-center justify-between mb-6">
        <div className="h-9 w-24 rounded-lg bg-neutral-200" />
        <div className="h-9 w-40 rounded-lg bg-neutral-200" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-neutral-200 h-80" />
        ))}
      </div>
    </div>
  );
}
