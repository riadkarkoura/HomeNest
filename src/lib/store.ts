"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";
import {
  syncAddItem,
  syncUpdateQuantity,
  syncRemoveItem,
  syncClearCart,
  mergeGuestCart,
  fetchServerCart,
} from "@/app/cart/actions";

// Records which authenticated user's cart has already been merged on this
// device, so repeat page loads hydrate from the server instead of
// re-merging (and re-adding) the same local quantities every time.
const MERGED_USER_KEY = "homenest-cart-merged-user";

interface CartStore {
  items: CartItem[];
  userId: string | null;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  // Called by the Navbar's existing auth-state effect on every session
  // transition. Handles merge-on-first-login, hydrate-on-return, and
  // reset-on-sign-out internally, so callers of every method above (
  // CartDrawer, the /cart page) stay completely unaware a server sync
  // exists -- their code is unchanged.
  setUserId: (id: string | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,

      addItem: (product) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { product, quantity: 1 }] });
        }
        if (get().userId) {
          syncAddItem(product.id, null, 1).catch((err) =>
            console.error("[cart sync] addItem failed", err)
          );
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
        if (get().userId) {
          syncRemoveItem(productId, null).catch((err) =>
            console.error("[cart sync] removeItem failed", err)
          );
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
        if (get().userId) {
          syncUpdateQuantity(productId, null, quantity).catch((err) =>
            console.error("[cart sync] updateQuantity failed", err)
          );
        }
      },

      clearCart: () => {
        set({ items: [] });
        if (get().userId) {
          syncClearCart().catch((err) =>
            console.error("[cart sync] clearCart failed", err)
          );
        }
      },

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (acc, i) => acc + i.product.price * i.quantity,
          0
        ),

      setUserId: (id) => {
        const prevId = get().userId;
        set({ userId: id });

        if (id && id !== prevId) {
          const mergedFor =
            typeof window !== "undefined" ? localStorage.getItem(MERGED_USER_KEY) : null;

          if (mergedFor === id) {
            // Already merged this device for this account -- hydrate from
            // the server (cross-device continuity) instead of re-merging.
            fetchServerCart()
              .then((items) => set({ items }))
              .catch((err) => console.error("[cart sync] fetchServerCart failed", err));
          } else {
            const localItems = get().items.map((i) => ({
              productId: i.product.id,
              variantId: null,
              quantity: i.quantity,
            }));
            mergeGuestCart(localItems)
              .then((items) => {
                set({ items });
                if (typeof window !== "undefined") {
                  localStorage.setItem(MERGED_USER_KEY, id);
                }
              })
              .catch((err) => console.error("[cart sync] mergeGuestCart failed", err));
          }
        } else if (!id && prevId) {
          // Signed out -- don't leak the previous account's cart to
          // whoever uses this device/browser next.
          set({ items: [] });
          if (typeof window !== "undefined") {
            localStorage.removeItem(MERGED_USER_KEY);
          }
        }
      },
    }),
    {
      name: "homenest-cart",
      // userId is derived fresh from the auth session on every load, never
      // persisted -- a stale value here could make the store briefly think
      // a signed-out browser is still logged in as whoever used it last.
      partialize: (state) => ({ items: state.items }),
    }
  )
);
