// Shown for the one render frame before useCartStore's persist middleware
// rehydrates `items` from localStorage (Sprint 8.1) -- without this,
// CheckoutClient briefly renders the empty-cart screen even for a returning
// customer whose cart has items, the same root cause as the pre-existing
// Navbar cart-badge hydration mismatch (see TESTING.md).
export default function CheckoutSkeleton() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 space-y-2">
          <div className="h-3 w-40 animate-pulse rounded bg-stone-200" />
          <div className="h-8 w-64 animate-pulse rounded bg-stone-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
                <div className="h-5 w-40 animate-pulse rounded bg-stone-100" />
                <div className="h-16 w-full animate-pulse rounded-xl bg-stone-100" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-stone-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
