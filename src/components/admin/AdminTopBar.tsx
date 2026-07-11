"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/promotions": "Promotions",
  "/admin/media": "Media Library",
  "/admin/ai-studio": "AI Studio",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Find the longest matching prefix (e.g. /admin/products/new → Products)
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname.startsWith(key + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "Admin";
}

interface Props {
  onMenuClick: () => void;
}

export default function AdminTopBar({ onMenuClick }: Props) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-4 border-b border-stone-100 bg-white px-6">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-900 truncate">{title}</p>
      </div>

      {/* Admin avatar */}
      <div
        aria-hidden="true"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white"
      >
        A
      </div>
    </header>
  );
}
