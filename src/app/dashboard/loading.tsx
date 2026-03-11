export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-7 w-36 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-52 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </header>

      {[1, 2, 3].map((i) => (
        <section
          key={i}
          className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
        >
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="h-3.5 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-3 px-6 py-5">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-50" />
          </div>
        </section>
      ))}
    </main>
  );
}
