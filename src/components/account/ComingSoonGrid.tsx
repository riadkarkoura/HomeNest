import { ACCOUNT_NAV_COMING_SOON } from "./nav-items";

// Renders the future-facing half of the account hub's nav config as a soft
// teaser grid — reinforces the "customer hub" direction now, without a route
// or page existing behind any of these yet.
export default function ComingSoonGrid() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">
        More from HomeNest, coming soon
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACCOUNT_NAV_COMING_SOON.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-stone-100 bg-white p-4 opacity-70"
            >
              <Icon className="h-5 w-5 text-stone-400 mb-2" />
              <p className="text-sm font-medium text-stone-700">{item.label}</p>
              {item.description && (
                <p className="text-xs text-stone-400 mt-1 line-clamp-2">{item.description}</p>
              )}
              <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-amber-600 font-medium">
                Coming soon
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
