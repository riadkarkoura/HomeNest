"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Tag,
  FolderOpen,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", icon: Package, label: "Products" },
      { href: "/admin/categories", icon: Layers, label: "Categories" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
      { href: "/admin/customers", icon: Users, label: "Customers" },
      { href: "/admin/promotions", icon: Tag, label: "Promotions" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/media", icon: FolderOpen, label: "Media Library" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/admin/ai-studio", icon: Sparkles, label: "AI Studio" },
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

function isActive(href: string, pathname: string, exact = false): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-stone-950/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-stone-900
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Admin navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-5">
          <Link href="/" className="text-lg font-semibold text-white">
            Home<span className="text-amber-400">Nest</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded p-1 text-stone-400 transition-colors hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map(({ label, items }, groupIndex) => (
            <div key={label ?? "__root"}>
              {label && (
                <p
                  className={`px-3 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-500 ${
                    groupIndex === 0 ? "pt-0" : "pt-5"
                  }`}
                >
                  {label}
                </p>
              )}
              <ul role="list" className="space-y-0.5">
                {items.map(({ href, icon: Icon, label: itemLabel, exact }) => {
                  const active = isActive(href, pathname, exact);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-stone-800 text-white"
                            : "text-stone-400 hover:bg-stone-800 hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 flex-shrink-0 transition-colors ${
                            active
                              ? "text-amber-400"
                              : "group-hover:text-amber-400"
                          }`}
                        />
                        {itemLabel}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-stone-800 px-3 py-4">
          <div className="mb-1 flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">Admin User</p>
              <p className="truncate text-xs text-stone-500">admin@homenest.com</p>
            </div>
          </div>
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}
