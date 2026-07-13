"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ACCOUNT_NAV_ACTIVE } from "./nav-items";

interface Props {
  name: string;
  email: string;
  children: ReactNode;
}

// Storefront-styled account hub shell — deliberately not a copy of AdminShell
// (no stone-900 sidebar, no enterprise-dashboard chrome). Matches the same
// header + pill-tab pattern already used by /cart and /products.
export default function AccountShell({ name, email, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">My Account</p>
          <h1 className="text-3xl sm:text-4xl font-light text-stone-900">
            Welcome back{name ? <>, <span className="font-semibold">{name}</span></> : ""}
          </h1>
          <p className="text-stone-500 mt-2">{email}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav
          className="flex flex-wrap gap-2 mb-8 overflow-x-auto"
          aria-label="Account sections"
        >
          {ACCOUNT_NAV_ACTIVE.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
