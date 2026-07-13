import {
  User, MapPin, ShieldCheck, Package, Heart, Receipt,
  Hammer, CalendarCheck, FileText, BadgeCheck,
} from "lucide-react";

// Single source of truth for the account hub's navigation. Shipping a future
// section (e.g. Security) is meant to be a one-line change here — flip
// `status` to "active" and add `href` — not a restructuring of AccountShell
// or the pages that read this config.
export type AccountNavStatus = "active" | "comingSoon";

export interface AccountNavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  status: AccountNavStatus;
  description?: string;
}

export interface AccountNavGroup {
  group: string;
  items: AccountNavItem[];
}

export const ACCOUNT_NAV: AccountNavGroup[] = [
  {
    group: "Account",
    items: [
      { label: "Profile", href: "/account", icon: User, status: "active" },
      { label: "Addresses", href: "/account/addresses", icon: MapPin, status: "active" },
      {
        label: "Security",
        icon: ShieldCheck,
        status: "comingSoon",
        description: "Password, two-factor authentication, and login activity.",
      },
    ],
  },
  {
    group: "Orders & Wishlist",
    items: [
      { label: "Orders", href: "/account/orders", icon: Package, status: "active" },
      { label: "Wishlist", href: "/account/wishlist", icon: Heart, status: "active" },
      {
        label: "Invoices",
        icon: Receipt,
        status: "comingSoon",
        description: "Download receipts and billing history.",
      },
    ],
  },
  {
    group: "My Home",
    items: [
      {
        label: "Home Projects",
        icon: Hammer,
        status: "comingSoon",
        description: "Track renovations and improvements room by room.",
      },
      {
        label: "Service Bookings",
        icon: CalendarCheck,
        status: "comingSoon",
        description: "Schedule and manage installation or repair visits.",
      },
      {
        label: "Home Documents",
        icon: FileText,
        status: "comingSoon",
        description: "Manuals, receipts, and home records in one place.",
      },
      {
        label: "Warranty Files",
        icon: BadgeCheck,
        status: "comingSoon",
        description: "Track coverage and expiry dates for every product.",
      },
    ],
  },
];

export const ACCOUNT_NAV_ACTIVE: AccountNavItem[] = ACCOUNT_NAV.flatMap((g) => g.items).filter(
  (item) => item.status === "active"
);

export const ACCOUNT_NAV_COMING_SOON: AccountNavItem[] = ACCOUNT_NAV.flatMap((g) => g.items).filter(
  (item) => item.status === "comingSoon"
);
