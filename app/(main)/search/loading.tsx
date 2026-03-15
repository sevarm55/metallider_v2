export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Breadcrumbs skeleton */}
      <div className="animate-pulse flex items-center gap-2 mb-6">
        <div className="h-4 w-16 rounded bg-neutral-200" />
        <div className="h-4 w-2 rounded bg-neutral-200" />
        <div className="h-4 w-16 rounded bg-neutral-200" />
      </div>

      {/* Title skeleton */}
      <div className="animate-pulse mb-1">
        <div className="h-8 w-80 rounded bg-neutral-200" />
      </div>

      {/* Results count skeleton */}
      <div className="animate-pulse mb-8">
        <div className="h-4 w-36 rounded bg-neutral-200" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-neutral-200 h-80" />
        ))}
      </div>
    </div>
  );
}
