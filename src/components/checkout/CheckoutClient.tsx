"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CheckoutIdentify from "./CheckoutIdentify";
import CheckoutAddressPicker from "./CheckoutAddressPicker";
import CheckoutPayment from "./CheckoutPayment";
import CheckoutSteps from "./CheckoutSteps";
import CheckoutSkeleton from "./CheckoutSkeleton";
import { createOrder } from "@/app/checkout/actions";
import { SHIPPING_OPTIONS, DEFAULT_SHIPPING_OPTION_ID } from "@/lib/checkout/shipping-options";
import type { AddressRow } from "@/lib/supabase/queries/account";

export interface CheckoutUser {
  id: string;
  email: string | null;
}

interface Props {
  initialUser: CheckoutUser | null;
  initialAddresses: AddressRow[];
}

export default function CheckoutClient({ initialUser, initialAddresses }: Props) {
  const router = useRouter();
  const { items, totalPrice } = useCartStore();

  // Local to this component only -- useCartStore's public API/behavior is
  // unchanged (Sprint 8.1). Zustand's persist middleware already exposes a
  // hasHydrated()/onFinishHydration() pair regardless of anything defined in
  // store.ts; without this guard, `items` reads as [] for one render frame
  // before localStorage rehydrates, which briefly shows the empty-cart
  // screen to a returning customer who actually has items in their cart.
  //
  // Patch 8.3.1: the initial state must be a plain `false` literal, not a
  // lazy useState(() => useCartStore.persist.hasHydrated()) initializer --
  // that reads `.persist` during render, which also runs on the server. In
  // a real Node.js SSR pass (not just Next's static-prerender build worker)
  // there is no `window`, so zustand's persist middleware never assigns
  // `api.persist` and this threw on every request. Deferring the read into
  // useEffect (same pattern as Navbar's Patch 8.2.2 fix) sidesteps this
  // entirely, since effects never run during server/build-time rendering.
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(useCartStore.persist.hasHydrated());
    return useCartStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  const [user, setUser] = useState(initialUser);
  const [identifying, setIdentifying] = useState(false);

  const [shippingAddressId, setShippingAddressId] = useState<string | null>(
    initialAddresses.find((a) => a.type === "shipping" && a.is_default)?.id ??
      initialAddresses.find((a) => a.type === "shipping")?.id ??
      null
  );
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddressId, setBillingAddressId] = useState<string | null>(
    initialAddresses.find((a) => a.type === "billing" && a.is_default)?.id ??
      initialAddresses.find((a) => a.type === "billing")?.id ??
      null
  );
  const [shippingMethodId, setShippingMethodId] = useState(DEFAULT_SHIPPING_OPTION_ID);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);

  const shippingAddresses = initialAddresses.filter((a) => a.type === "shipping");
  const billingAddresses = initialAddresses.filter((a) => a.type === "billing");

  const subtotal = totalPrice();
  const shippingOption =
    SHIPPING_OPTIONS.find((o) => o.id === shippingMethodId) ?? SHIPPING_OPTIONS[0];
  const total = subtotal + shippingOption.cost;

  async function handleIdentified() {
    setIdentifying(true);
    try {
      // The sign-in/sign-up Server Action ran server-side, so this
      // browser's Supabase client doesn't know about the new session yet
      // (no client-side auth call fired to update it) -- read it fresh.
      const { data } = await createClient().auth.getUser();
      if (data.user) {
        await useCartStore.getState().setUserId(data.user.id);
        setUser({ id: data.user.id, email: data.user.email ?? null });
      }
      router.refresh();
    } finally {
      setIdentifying(false);
    }
  }

  function handleAddressAdded() {
    router.refresh();
  }

  const shippingComplete = !!shippingAddressId;
  const billingComplete = billingSameAsShipping || !!billingAddressId;
  const deliveryComplete = !!shippingMethodId;

  const canPlaceOrder =
    !!user && shippingComplete && billingComplete && items.length > 0 && !placing;

  async function handlePlaceOrder() {
    if (!shippingAddressId) return;
    setPlacing(true);
    setPlaceError(null);

    const result = await createOrder({
      shippingAddressId,
      billingAddressId: billingSameAsShipping ? null : billingAddressId,
      shippingMethodId: shippingOption.id,
    });

    setPlacing(false);

    if (!result.ok) {
      setPlaceError(result.error);
      return;
    }

    // The server-side cart already flipped to 'converted' inside
    // createOrder() -- clear the local mirror too so the next visit to
    // /cart starts fresh rather than showing items that were just ordered.
    useCartStore.getState().clearCart();
    // Order creation and payment are decoupled (docs/ARCHITECTURE.md §12.1)
    // -- the order already exists as pending/unpaid, so show the payment
    // step next rather than navigating away immediately.
    setPlacedOrderNumber(result.orderNumber);
  }

  // Checked first: before hydration finishes, `items` reads as [] regardless
  // of what's actually in localStorage -- showing the skeleton here avoids
  // the empty-cart screen flashing for a returning customer.
  if (!hasHydrated) {
    return <CheckoutSkeleton />;
  }

  // Checked before the empty-cart guard below: clearCart() already emptied
  // `items` the moment the order was placed, so without this order the
  // customer would be bounced to the "cart is empty" screen instead of
  // seeing the payment step for the order they just created.
  if (placedOrderNumber) {
    return (
      <div className="bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">
              Order {placedOrderNumber}
            </p>
            <h1 className="text-2xl font-light text-stone-900">
              Complete your <span className="font-semibold">payment</span>
            </h1>
          </div>
          <CheckoutPayment orderNumber={placedOrderNumber} />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <ShoppingBag className="h-20 w-20 text-stone-200 mx-auto" />
          <h1 className="text-2xl font-light text-stone-900">Your cart is empty</h1>
          <p className="text-stone-500">Add something to your cart before checking out.</p>
          <Link href="/products">
            <Button className="bg-stone-900 hover:bg-amber-700 text-white mt-4">
              Explore the Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">
            Cart &rarr; Checkout &rarr; Confirmation
          </p>
          <h1 className="text-3xl font-light text-stone-900">
            Secure <span className="font-semibold">Checkout</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!user ? (
              <CheckoutIdentify onIdentified={handleIdentified} />
            ) : (
              <>
                <CheckoutSteps
                  steps={[
                    { label: "Shipping", complete: shippingComplete },
                    { label: "Billing", complete: billingComplete },
                    { label: "Delivery", complete: deliveryComplete },
                    { label: "Review", complete: shippingComplete && billingComplete },
                  ]}
                />

                <section className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
                  <h2 className="font-semibold text-stone-900 text-lg">Shipping Address</h2>
                  {!shippingComplete && (
                    <p className="text-xs text-amber-600">Select or add an address to continue.</p>
                  )}
                  <CheckoutAddressPicker
                    addresses={shippingAddresses}
                    selectedId={shippingAddressId}
                    onSelect={setShippingAddressId}
                    onAdded={handleAddressAdded}
                    emptyLabel="No shipping addresses saved yet — add one below."
                  />
                </section>

                <section className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
                  <h2 className="font-semibold text-stone-900 text-lg">Billing Address</h2>
                  <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    Same as shipping address
                  </label>
                  {!billingSameAsShipping && (
                    <>
                      {!billingAddressId && (
                        <p className="text-xs text-amber-600">
                          Select or add a billing address to continue.
                        </p>
                      )}
                      <CheckoutAddressPicker
                        addresses={billingAddresses}
                        selectedId={billingAddressId}
                        onSelect={setBillingAddressId}
                        onAdded={handleAddressAdded}
                        emptyLabel="No billing addresses saved yet — add one below."
                      />
                    </>
                  )}
                </section>

                <section className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
                  <h2 className="font-semibold text-stone-900 text-lg">Delivery Options</h2>
                  <div className="space-y-3">
                    {SHIPPING_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between rounded-xl border p-4 text-sm cursor-pointer transition-colors ${
                          shippingMethodId === option.id
                            ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-method"
                            checked={shippingMethodId === option.id}
                            onChange={() => setShippingMethodId(option.id)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                          />
                          <span>
                            <span className="block font-medium text-stone-900">{option.label}</span>
                            <span className="block text-xs text-stone-400">{option.description}</span>
                          </span>
                        </span>
                        <span className="font-medium text-stone-900">
                          {option.cost === 0 ? "Free" : `$${option.cost}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
                  <h2 className="font-semibold text-stone-900 text-lg">Order Review</h2>
                  <div className="space-y-3">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-4 items-center">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                          <p className="text-xs text-stone-400">Qty {quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-stone-900">
                          ${(product.price * quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {placeError && <p className="text-sm text-destructive">{placeError}</p>}

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!canPlaceOrder}
                    className="w-full bg-stone-900 hover:bg-amber-700 text-white py-6 text-base gap-2"
                  >
                    {placing ? "Placing your order…" : "Place Order"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {!(shippingComplete && billingComplete) && (
                    <p className="text-xs text-stone-400 text-center">
                      Complete the steps above to place your order.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-stone-100 sticky top-24 space-y-5">
              <h2 className="font-semibold text-stone-900 text-lg">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping ({shippingOption.label})</span>
                  <span className={shippingOption.cost === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingOption.cost === 0 ? "Free" : `$${shippingOption.cost}`}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-stone-900 text-lg">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>

              <p className="text-xs text-stone-400 text-center">
                {identifying ? "Signing you in…" : "Secure checkout · SSL encrypted"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
