export default function CartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Breadcrumbs skeleton */}
      <div className="animate-pulse flex items-center gap-2 mb-6">
        <div className="h-4 w-16 rounded bg-neutral-200" />
        <div className="h-4 w-2 rounded bg-neutral-200" />
        <div className="h-4 w-20 rounded bg-neutral-200" />
      </div>

      {/* Header skeleton */}
      <div className="animate-pulse mb-10">
        <div className="h-4 w-24 rounded bg-neutral-200 mb-3" />
        <div className="h-10 w-48 rounded bg-neutral-200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — cart items + form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart items card */}
          <div className="rounded-2xl bg-white border border-neutral-200 p-4 space-y-3">
            <div className="animate-pulse h-5 w-24 rounded bg-neutral-200 mb-2" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 rounded-xl bg-neutral-50 p-3">
                <div className="h-24 w-24 shrink-0 rounded-xl bg-neutral-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-neutral-200" />
                  <div className="h-3 w-20 rounded bg-neutral-200" />
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="h-8 w-28 rounded-lg bg-neutral-200" />
                    <div className="h-5 w-24 rounded bg-neutral-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout form card */}
          <div className="animate-pulse rounded-2xl bg-white border border-neutral-200 p-6 space-y-6">
            {/* Contact section */}
            <div className="space-y-3">
              <div className="h-5 w-40 rounded bg-neutral-200 mb-4" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-11 rounded-xl bg-neutral-200" />
                <div className="h-11 rounded-xl bg-neutral-200" />
              </div>
              <div className="h-11 rounded-xl bg-neutral-200" />
            </div>
            {/* Delivery section */}
            <div className="space-y-3">
              <div className="h-5 w-40 rounded bg-neutral-200 mb-4" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-24 rounded-xl bg-neutral-200" />
                <div className="h-24 rounded-xl bg-neutral-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — summary */}
        <div className="lg:col-span-1">
          <div className="animate-pulse rounded-2xl bg-white border border-neutral-200 p-6 space-y-4">
            <div className="h-6 w-20 rounded bg-neutral-200" />
            <div className="h-px bg-neutral-100" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-neutral-200" />
                <div className="h-4 w-8 rounded bg-neutral-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-neutral-200" />
                <div className="h-4 w-24 rounded bg-neutral-200" />
              </div>
            </div>
            <div className="h-px bg-neutral-100" />
            <div className="flex justify-between items-baseline">
              <div className="h-4 w-16 rounded bg-neutral-200" />
              <div className="h-8 w-32 rounded bg-neutral-200" />
            </div>
            <div className="h-12 w-full rounded-xl bg-neutral-200" />
            <div className="h-16 w-full rounded-xl bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
