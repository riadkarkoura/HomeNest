// ─── Core models ─────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  longDescription: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  dimensions?: string;
  material?: string;
  // Enrichment — used by ProductCard, admin dashboard
  badge?: "Bestseller" | "New" | "Editor's Pick" | "Sale";
  problemSolved?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

// ─── Future: Product Reviews ──────────────────────────────────────────────────
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
  helpful: number;
}

// ─── Future: Wishlist ─────────────────────────────────────────────────────────
export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
}

// ─── Future: AI Smart Search ──────────────────────────────────────────────────
export interface SearchResult {
  query: string;
  products: Product[];
  suggestions: string[];
  problemMatches: string[];
}

// ─── Future: Payments (Stripe / PayPal) ──────────────────────────────────────
export type PaymentProvider = "stripe" | "paypal";

export interface PaymentIntent {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
}

// ─── Future: Multi-currency ───────────────────────────────────────────────────
export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export interface PriceLocale {
  amount: number;
  currency: Currency;
  formatted: string;
}

// ─── Future: Personalised recommendations ────────────────────────────────────
export interface Recommendation {
  productId: string;
  score: number;
  reason: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export type Category =
  | "All"
  | "Kitchen"
  | "Bathroom"
  | "Storage"
  | "Cleaning"
  | "Bedroom"
  | "Office"
  | "Outdoor";
