export default function HomeLoading() {
  return (
    <>
      {/* Hero Bento skeleton */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="animate-pulse">
            <div className="h-[400px] rounded-2xl bg-neutral-200" />
          </div>
        </div>
      </section>

      {/* Categories section skeleton */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse mb-10">
            <div className="h-4 w-32 rounded bg-neutral-200 mb-3" />
            <div className="h-10 w-72 rounded bg-neutral-200" />
          </div>
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 w-80 shrink-0 rounded-2xl bg-neutral-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Popular products skeleton */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse mb-10">
            <div className="h-4 w-28 rounded bg-neutral-200 mb-3" />
            <div className="h-10 w-80 rounded bg-neutral-200" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-neutral-200 h-80" />
            ))}
          </div>
        </div>
      </section>

      {/* Calculator skeleton */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse mb-10">
            <div className="h-4 w-24 rounded bg-neutral-200 mb-3" />
            <div className="h-10 w-72 rounded bg-neutral-200 mb-2" />
            <div className="h-4 w-96 rounded bg-neutral-200" />
          </div>
          <div className="animate-pulse h-64 rounded-2xl bg-neutral-200" />
        </div>
      </section>

      {/* Reviews skeleton */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse mb-10">
            <div className="h-4 w-28 rounded bg-neutral-200 mb-3" />
            <div className="h-10 w-64 rounded bg-neutral-200" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-neutral-200 h-48" />
            ))}
          </div>
        </div>
      </section>

      {/* Advantages skeleton */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse mb-10">
            <div className="h-4 w-32 rounded bg-neutral-200 mb-3" />
            <div className="h-10 w-72 rounded bg-neutral-200" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-neutral-200 h-44" />
            ))}
          </div>
        </div>
      </section>

      {/* About + Contact skeleton */}
      <section className="bg-neutral-100 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5 lg:gap-16 animate-pulse">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-4 w-28 rounded bg-neutral-200" />
              <div className="h-12 w-64 rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-5/6 rounded bg-neutral-200" />
              <div className="h-4 w-4/6 rounded bg-neutral-200" />
              <div className="flex gap-3 mt-8">
                <div className="h-12 w-48 rounded-xl bg-neutral-200" />
                <div className="h-12 w-48 rounded-xl bg-neutral-200" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-80 rounded-2xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
