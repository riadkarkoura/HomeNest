"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart, Menu, X, Search, User, LogOut, MapPin, Package, Heart,
  ChevronDown, ArrowUpRight, ChevronRight,
} from "lucide-react";
import {
  useState, useEffect, useRef, useCallback,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { EASE } from "@/lib/motion";
import { useCartStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CartDrawer from "@/components/shop/CartDrawer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MegaCategory {
  name: string;
  href: string;
  count: number;
  image: string;
}

interface MegaData {
  categories: MegaCategory[];
  editorial: { title: string; subtitle: string; href: string; image: string };
  quickLinks: Array<{ label: string; href: string; badge?: string }>;
}

interface NavItem {
  label: string;
  href?: string;
  mega?: MegaData;
}

// ─── Navigation data ──────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Solutions",
    mega: {
      categories: [
        {
          name: "Kitchen",
          href: "/products?category=Kitchen",
          count: 32,
          image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&q=80",
        },
        {
          name: "Bathroom",
          href: "/products?category=Bathroom",
          count: 18,
          image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=400&q=80",
        },
        {
          name: "Storage",
          href: "/products?category=Storage",
          count: 24,
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
        },
        {
          name: "Cleaning",
          href: "/products?category=Cleaning",
          count: 12,
          image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",
        },
      ],
      editorial: {
        title: "Editor's Pick: Kitchen Fixes",
        subtitle: "The five products that will genuinely transform your kitchen this week.",
        href: "/products?category=Kitchen",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=85",
      },
      quickLinks: [
        { label: "New Arrivals", href: "/products" },
        { label: "Best Sellers", href: "/products" },
        { label: "Sale", href: "/products", badge: "Up to 30% off" },
        { label: "Gift Guide", href: "/products" },
      ],
    },
  },
  { label: "New Arrivals", href: "/products" },
  { label: "How It Works", href: "#" },
  { label: "Journal",      href: "#" },
];

const SEARCH_SUGGESTIONS = [
  "Sink splash guard", "Drawer organizer", "Shower caddy", "Knife strip",
  "Under-sink rack", "Lazy susan", "Bathroom shelf", "Storage cubes",
];

// ─── Search overlay ───────────────────────────────────────────────────────────

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex flex-col"
      aria-modal="true"
      role="dialog"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/94 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.32, ease: EASE, delay: 0.06 }}
        className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-[18vh]"
      >
        {/* Input row */}
        <div className="flex items-center gap-5 border-b border-white/15 pb-4 group focus-within:border-white/35 transition-colors duration-300">
          <Search className="h-5 w-5 text-white/30 flex-shrink-0 group-focus-within:text-amber-400/70 transition-colors duration-300" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search kitchen, bathroom, storage solutions…"
            className="flex-1 bg-transparent text-white text-[1.35rem] sm:text-2xl font-light placeholder:text-white/22 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-white/30 hover:text-white transition-colors duration-200 flex-shrink-0"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16, ease: EASE }}
          className="mt-10"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/28 mb-5">
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2.5">
            {SEARCH_SUGGESTIONS.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="text-[13px] text-white/45 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 transition-all duration-200 hover:bg-white/[0.04]"
              >
                {term}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22, ease: EASE }}
          className="mt-10 pt-8 border-t border-white/[0.07]"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/28 mb-5">
            Browse by room
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV_ITEMS[0].mega!.categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-amber-300 transition-colors duration-200 group"
              >
                {cat.name}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-y-px group-hover:translate-x-px transition-all duration-200" />
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Mega menu panel ──────────────────────────────────────────────────────────

function MegaPanel({
  data,
  onClose,
  isLight,
}: {
  data: MegaData;
  onClose: () => void;
  isLight: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const activeImage =
    data.categories.find((c) => c.name === hovered)?.image ??
    data.editorial.image;

  return (
    <motion.div
      initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
      exit={{
        opacity: 0,
        clipPath: "inset(0 0 100% 0)",
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
      }}
      transition={{ duration: 0.38, ease: EASE }}
      className="absolute top-full left-0 right-0 z-40 bg-[#FAFAF8] border-t border-stone-100 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.14)]"
      aria-label="Collections menu"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-10">
        <div className="grid grid-cols-12 gap-10">

          {/* ── Left: categories + quick links ── */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-6">
              Shop by Room
            </p>

            <ul className="space-y-1" role="list">
              {data.categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    onClick={onClose}
                    onMouseEnter={() => setHovered(cat.name)}
                    onMouseLeave={() => setHovered(null)}
                    className="group flex items-center justify-between py-2.5 px-3 -mx-3 hover:bg-stone-100/70 transition-colors duration-200 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        animate={{ x: hovered === cat.name ? 4 : 0 }}
                        transition={{ duration: 0.22, ease: EASE }}
                        className="text-[15px] font-light text-stone-800 group-hover:text-stone-950"
                      >
                        {cat.name}
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-stone-400">
                        {cat.count} solutions
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="border-t border-stone-150 my-7" />

            {/* Quick links */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-4">
              Quick links
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {data.quickLinks.map(({ label, href, badge }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-2 text-[13px] text-stone-500 hover:text-amber-700 transition-colors duration-200"
                >
                  {label}
                  {badge && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Center: image preview ── */}
          <div className="hidden lg:block col-span-4 relative">
            <div className="relative h-full min-h-[260px] overflow-hidden bg-stone-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/30 to-transparent" />
              {hovered && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 text-xs uppercase tracking-widest text-white/80"
                >
                  {hovered}
                </motion.p>
              )}
            </div>
          </div>

          {/* ── Right: editorial feature ── */}
          <div className="col-span-12 md:col-span-7 lg:col-span-4">
            <div className="relative overflow-hidden bg-stone-900 group cursor-pointer h-full min-h-[260px]">
              <Image
                src={data.editorial.image}
                alt={data.editorial.title}
                fill
                className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                sizes="360px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
              <div className="absolute inset-0 p-7 flex flex-col justify-end">
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 mb-2">
                  Featured Edit
                </p>
                <h3
                  className="text-xl text-white font-light leading-snug mb-2"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {data.editorial.title}
                </h3>
                <p className="text-[13px] text-stone-400 font-light leading-relaxed mb-5 max-w-[280px]">
                  {data.editorial.subtitle}
                </p>
                <Link
                  href={data.editorial.href}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest text-white/70 hover:text-amber-300 transition-colors duration-200 group/link"
                >
                  Explore
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// ─── Mobile panel ─────────────────────────────────────────────────────────────

function MobilePanel({
  onClose, user, onSignOut,
}: {
  onClose: () => void;
  user: SupabaseUser | null;
  onSignOut: () => void;
}) {
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="fixed inset-x-0 top-[4.5rem] bottom-0 z-40 flex flex-col bg-[#FAFAF8] border-t border-stone-100 overflow-y-auto md:hidden"
    >
      <nav className="flex-1 px-6 pt-4 pb-6">
        {/* Collections accordion */}
        <button
          onClick={() => setCollectionsOpen((v) => !v)}
          className="flex items-center justify-between w-full py-4 text-left border-b border-stone-100"
        >
          <span className="text-base font-light text-stone-800">Collections</span>
          <motion.span
            animate={{ rotate: collectionsOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </motion.span>
        </button>

        <AnimatePresence>
          {collectionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-4 pl-4 space-y-0.5">
                {NAV_ITEMS[0].mega!.categories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.22, ease: EASE }}
                  >
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className="flex items-center justify-between py-2.5 text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      <span className="text-[15px] font-light">{cat.name}</span>
                      <span className="text-[11px] text-stone-400">{cat.count}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple links */}
        {NAV_ITEMS.slice(1).map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.25, ease: EASE }}
          >
            <Link
              href={item.href ?? "#"}
              onClick={onClose}
              className="flex items-center justify-between py-4 border-b border-stone-100 text-base font-light text-stone-800 hover:text-stone-950 transition-colors"
            >
              {item.label}
            </Link>
          </motion.div>
        ))}

        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 py-4 border-b border-stone-100 text-base font-light text-stone-800 hover:text-stone-950 transition-colors"
            >
              <User className="h-4 w-4 text-stone-400" />
              My Account
            </Link>
            <Link
              href="/account/addresses"
              onClick={onClose}
              className="flex items-center gap-3 py-4 border-b border-stone-100 text-base font-light text-stone-800 hover:text-stone-950 transition-colors"
            >
              <MapPin className="h-4 w-4 text-stone-400" />
              Addresses
            </Link>
            <Link
              href="/account/orders"
              onClick={onClose}
              className="flex items-center gap-3 py-4 border-b border-stone-100 text-base font-light text-stone-800 hover:text-stone-950 transition-colors"
            >
              <Package className="h-4 w-4 text-stone-400" />
              Orders
            </Link>
            <Link
              href="/account/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 py-4 border-b border-stone-100 text-base font-light text-stone-800 hover:text-stone-950 transition-colors"
            >
              <Heart className="h-4 w-4 text-stone-400" />
              Wishlist
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {user ? (
            <button
              onClick={() => { onSignOut(); onClose(); }}
              className="flex w-full items-center justify-between py-4 border-b border-stone-100 text-base font-light text-stone-800 hover:text-stone-950"
            >
              Sign out
              <span className="truncate text-sm text-stone-400">{user.email}</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-between py-4 border-b border-stone-100 text-base font-light text-stone-800 hover:text-stone-950"
            >
              Sign In / Register
            </Link>
          )}
        </motion.div>
      </nav>

      {/* Footer strip */}
      <div className="px-6 py-5 border-t border-stone-100 flex items-center justify-between">
        <p className="text-[11px] text-stone-400">Free shipping on orders over $500</p>
        <Link
          href="/products"
          onClick={onClose}
          className="text-[11px] uppercase tracking-widest text-amber-700 font-medium"
        >
          Shop all
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems)();

  const [scrolled,    setScrolled]    = useState(false);
  const [activeMenu,  setActiveMenu]  = useState<string | null>(null);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [user,        setUser]        = useState<SupabaseUser | null>(null);

  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Session state — live via onAuthStateChange, not just a one-time read ──
  // Also drives the cart store's server sync (Sprint 7.2 Phase 2) — same
  // session transitions this effect already tracks, just also handed to
  // useCartStore so merge/hydrate/reset happens without a second listener.
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      useCartStore.getState().setUserId(data.user?.id ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      useCartStore.getState().setUserId(session?.user?.id ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  // ── Scroll listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Close everything on route change ────────────────────────────────────
  useEffect(() => {
    setActiveMenu(null);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // ── Body scroll lock when overlays open ─────────────────────────────────
  useEffect(() => {
    const locked = searchOpen || mobileOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen, mobileOpen]);

  // ── Global ESC handler ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Hover-intent helpers ─────────────────────────────────────────────────
  const openMenu = useCallback((label: string) => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    setActiveMenu(label);
  }, []);

  const scheduleClose = useCallback(() => {
    menuTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────
  // Force glass background when mega or mobile is open, even at the top
  const isGlass  = scrolled || activeMenu !== null || mobileOpen;
  // Use light (dark text) colours when the glass background is showing
  const isLight  = isGlass;

  const iconColor    = isLight ? "#57534e" : "rgba(255,255,255,0.72)";
  const logoColor    = isLight ? "#1c1917" : "#ffffff";
  const nestColor    = isLight ? "#b45309" : "#fbbf24";
  const navLinkColor = isLight ? "#78716c" : "rgba(255,255,255,0.75)";

  return (
    <LayoutGroup>
      {/* ── Main header ─────────────────────────────────────────────────── */}
      <motion.header
        animate={{ height: scrolled ? "3.75rem" : "4.5rem" }}
        transition={{ duration: 0.4, ease: EASE }}
        className="fixed top-0 inset-x-0 z-50 flex flex-col"
        style={{ willChange: "height" }}
      >
        {/* Glassmorphism layer — animated in/out independently */}
        <motion.div
          animate={{ opacity: isGlass ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-0 bg-[rgba(250,250,248,0.88)] backdrop-blur-2xl border-b border-black/[0.06]"
          style={{
            boxShadow: isGlass
              ? "0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)"
              : "none",
          }}
          aria-hidden="true"
        />

        {/* Nav row */}
        <nav className="relative flex items-center h-full max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-14">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center mr-10 flex-shrink-0 z-10">
            <motion.span
              animate={{ color: logoColor }}
              transition={{ duration: 0.35 }}
              className="tracking-tight select-none"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: scrolled ? "1.1rem" : "1.2rem",
                transition: "font-size 0.35s ease",
              }}
            >
              Home
              <motion.span
                animate={{ color: nestColor }}
                transition={{ duration: 0.35 }}
              >
                Nest
              </motion.span>
            </motion.span>
          </Link>

          {/* ── Desktop nav items ────────────────────────────────────────── */}
          <ul className="hidden md:flex items-center gap-1 flex-1" role="list">
            {NAV_ITEMS.map((item) => {
              const hasMega = !!item.mega;
              const isActive = activeMenu === item.label;

              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasMega ? openMenu(item.label) : cancelClose()}
                  onMouseLeave={scheduleClose}
                >
                  {item.href && !hasMega ? (
                    /* Simple link */
                    <motion.div animate={{ color: navLinkColor }} transition={{ duration: 0.35 }}>
                      <Link
                        href={item.href}
                        className="relative flex items-center gap-1 px-3.5 py-2 text-[13px] tracking-wide group"
                      >
                        <span className="relative">
                          {item.label}
                          <span className="absolute -bottom-px left-0 right-0 h-px bg-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </span>
                      </Link>
                    </motion.div>
                  ) : (
                    /* Mega trigger */
                    <motion.div animate={{ color: navLinkColor }} transition={{ duration: 0.35 }}>
                      <button
                        onClick={() => setActiveMenu(isActive ? null : item.label)}
                        className="relative flex items-center gap-1.5 px-3.5 py-2 text-[13px] tracking-wide group"
                        aria-haspopup="true"
                        aria-expanded={isActive}
                      >
                        <span className="relative">
                          {item.label}
                          <span className="absolute -bottom-px left-0 right-0 h-px bg-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </span>
                        <motion.span
                          animate={{ rotate: isActive ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                        >
                          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                        </motion.span>

                        {/* Active indicator dot */}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-dot"
                            className="absolute -bottom-[1.5px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-600"
                            transition={{ duration: 0.25, ease: EASE }}
                          />
                        )}
                      </button>
                    </motion.div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-0.5 ml-auto md:ml-0">
            {/* Search */}
            <motion.button
              animate={{ color: iconColor }}
              transition={{ duration: 0.35 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => { setSearchOpen(true); setMobileOpen(false); setActiveMenu(null); }}
              className="hidden md:flex h-9 w-9 items-center justify-center"
              aria-label="Open search"
            >
              <Search className="h-[16px] w-[16px]" />
            </motion.button>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <motion.button
                      animate={{ color: iconColor }}
                      transition={{ duration: 0.35 }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      className="hidden h-9 w-9 items-center justify-center md:flex"
                      aria-label="Account menu"
                    />
                  }
                >
                  <User className="h-[16px] w-[16px]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="truncate font-normal text-stone-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/account" />} className="gap-2 text-stone-700">
                      <User className="h-4 w-4" />
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account/addresses" />} className="gap-2 text-stone-700">
                      <MapPin className="h-4 w-4" />
                      Addresses
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account/orders" />} className="gap-2 text-stone-700">
                      <Package className="h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account/wishlist" />} className="gap-2 text-stone-700">
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-stone-700">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden md:flex">
                <motion.button
                  animate={{ color: iconColor }}
                  transition={{ duration: 0.35 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="h-9 w-9 items-center justify-center flex"
                  aria-label="Account"
                >
                  <User className="h-[16px] w-[16px]" />
                </motion.button>
              </Link>
            )}

            {/* Cart */}
            <Sheet>
              <SheetTrigger
                render={
                  <motion.button
                    animate={{ color: iconColor }}
                    transition={{ duration: 0.35 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="relative flex h-9 w-9 items-center justify-center"
                    aria-label={`Cart, ${totalItems} items`}
                  />
                }
              >
                <ShoppingCart className="h-[16px] w-[16px]" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 18 }}
                      className="absolute -top-0.5 -right-0.5 h-[14px] w-[14px] rounded-full bg-amber-600 text-white text-[8px] font-medium flex items-center justify-center leading-none"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md p-6">
                <CartDrawer />
              </SheetContent>
            </Sheet>

            {/* Separator (desktop) */}
            <div className="hidden md:block w-px h-4 bg-current opacity-10 mx-2" />

            {/* Shop CTA (desktop) */}
            <motion.div
              animate={{ opacity: isLight ? 1 : 0.85 }}
              className="hidden md:block"
            >
              <Link href="/products">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] font-medium px-5 py-2"
                  style={{
                    backgroundColor: isLight ? "#1c1917" : "rgba(255,255,255,0.12)",
                    color: isLight ? "#fafaf8" : "#ffffff",
                    border: isLight ? "none" : "1px solid rgba(255,255,255,0.2)",
                    transition: "background-color 0.35s ease, border-color 0.35s ease",
                  }}
                >
                  Shop now
                </motion.span>
              </Link>
            </motion.div>

            {/* Mobile hamburger */}
            <motion.button
              animate={{ color: iconColor }}
              transition={{ duration: 0.35 }}
              className="md:hidden flex h-9 w-9 items-center justify-center ml-1"
              onClick={() => { setMobileOpen((v) => !v); setActiveMenu(null); setSearchOpen(false); }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ opacity: 0, rotate: 45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -45 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        {/* ── Mega menu panel (inside header so it inherits z-index) ─────── */}
        <AnimatePresence>
          {activeMenu && NAV_ITEMS.find((i) => i.label === activeMenu)?.mega && (
            <div
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <MegaPanel
                data={NAV_ITEMS.find((i) => i.label === activeMenu)!.mega!}
                onClose={() => setActiveMenu(null)}
                isLight={isLight}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Mobile panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <MobilePanel onClose={() => setMobileOpen(false)} user={user} onSignOut={handleSignOut} />
        )}
      </AnimatePresence>

      {/* ── Search overlay ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </LayoutGroup>
  );
}
