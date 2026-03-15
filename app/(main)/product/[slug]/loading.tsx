export default function ProductLoading() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Breadcrumbs skeleton */}
        <div className="animate-pulse flex items-center gap-2 mb-6">
          <div className="h-4 w-16 rounded bg-neutral-200" />
          <div className="h-4 w-2 rounded bg-neutral-200" />
          <div className="h-4 w-16 rounded bg-neutral-200" />
          <div className="h-4 w-2 rounded bg-neutral-200" />
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-4 w-2 rounded bg-neutral-200" />
          <div className="h-4 w-48 rounded bg-neutral-200" />
        </div>

        {/* Main product section */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Left: Gallery skeleton */}
          <div className="animate-pulse">
            <div className="h-[400px] lg:h-[500px] rounded-2xl bg-neutral-200 mb-4" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 w-20 rounded-xl bg-neutral-200" />
              ))}
            </div>
          </div>

          {/* Right: Product info skeleton */}
          <div className="animate-pulse">
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-24 rounded-full bg-neutral-200" />
              <div className="h-6 w-20 rounded-full bg-neutral-200" />
            </div>

            {/* Title */}
            <div className="h-8 w-full rounded bg-neutral-200 mb-2" />
            <div className="h-8 w-3/4 rounded bg-neutral-200 mb-3" />

            {/* Meta */}
            <div className="flex gap-4 mb-6">
              <div className="h-4 w-24 rounded bg-neutral-200" />
              <div className="h-4 w-32 rounded bg-neutral-200" />
            </div>

            {/* Price card */}
            <div className="rounded-2xl bg-white border border-neutral-200 p-6 mb-4">
              <div className="h-10 w-40 rounded bg-neutral-200 mb-4" />
              <div className="h-5 w-36 rounded bg-neutral-200 mb-5" />
              <div className="h-12 w-full rounded-xl bg-neutral-200 mb-3" />
              <div className="h-12 w-full rounded-xl bg-neutral-200" />
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-neutral-200" />
              ))}
            </div>

            {/* Specs table */}
            <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <div className="h-4 w-32 rounded bg-neutral-200" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div className="h-4 w-28 rounded bg-neutral-200" />
                  <div className="h-4 w-20 rounded bg-neutral-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description & Delivery skeleton */}
        <div className="grid gap-4 lg:grid-cols-2 mt-8">
          <div className="animate-pulse rounded-2xl bg-neutral-200 h-48" />
          <div className="animate-pulse rounded-2xl bg-neutral-200 h-48" />
        </div>

        {/* Related products skeleton */}
        <div className="mt-12">
          <div className="animate-pulse flex items-center justify-between mb-6">
            <div className="h-6 w-48 rounded bg-neutral-200" />
            <div className="h-4 w-32 rounded bg-neutral-200" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-neutral-200 h-80" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
