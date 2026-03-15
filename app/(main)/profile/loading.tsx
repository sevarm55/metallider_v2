export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Breadcrumbs skeleton */}
      <div className="animate-pulse flex items-center gap-2 mb-6">
        <div className="h-4 w-16 rounded bg-neutral-200" />
        <div className="h-4 w-2 rounded bg-neutral-200" />
        <div className="h-4 w-32 rounded bg-neutral-200" />
      </div>

      {/* Header + logout button */}
      <div className="animate-pulse flex items-center justify-between mb-6">
        <div className="h-8 w-52 rounded bg-neutral-200" />
        <div className="h-9 w-24 rounded-lg bg-neutral-200" />
      </div>

      {/* Tabs skeleton */}
      <div className="animate-pulse flex gap-2 mb-6">
        <div className="h-10 w-28 rounded-lg bg-neutral-200" />
        <div className="h-10 w-28 rounded-lg bg-neutral-200" />
        <div className="h-10 w-36 rounded-lg bg-neutral-200" />
      </div>

      {/* Profile form card skeleton */}
      <div className="animate-pulse rounded-xl border border-neutral-200 bg-white">
        <div className="p-6 border-b border-neutral-100">
          <div className="h-6 w-36 rounded bg-neutral-200" />
        </div>
        <div className="p-6 space-y-4 max-w-lg">
          {/* Name field */}
          <div className="space-y-2">
            <div className="h-4 w-12 rounded bg-neutral-200" />
            <div className="h-10 w-full rounded-lg bg-neutral-200" />
          </div>
          {/* Email field */}
          <div className="space-y-2">
            <div className="h-4 w-12 rounded bg-neutral-200" />
            <div className="h-10 w-full rounded-lg bg-neutral-200" />
            <div className="h-3 w-40 rounded bg-neutral-200" />
          </div>
          {/* Phone field */}
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-neutral-200" />
            <div className="h-10 w-full rounded-lg bg-neutral-200" />
          </div>
          {/* Registration date */}
          <div className="h-3 w-48 rounded bg-neutral-200" />
          {/* Save button */}
          <div className="h-10 w-32 rounded-lg bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
