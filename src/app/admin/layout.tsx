import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  LogOut,
} from "lucide-react";

export const metadata: Metadata = {
  title: { default: "Admin Dashboard", template: "%s | Admin · HomeNest" },
};

const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/promotions", icon: Tag, label: "Promotions" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col">
        <div className="px-6 py-5 border-b border-stone-800">
          <Link href="/" className="text-lg font-semibold text-white">
            Home<span className="text-amber-400">Nest</span>
          </Link>
          <p className="text-xs text-stone-500 mt-0.5">Admin Console</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 hover:text-white transition-colors group"
            >
              <Icon className="h-4 w-4 group-hover:text-amber-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-stone-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-stone-500">admin@homenest.com</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
