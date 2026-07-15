"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSignIn, checkoutSignUp, type IdentifyState } from "@/app/checkout/actions";

const initialState: IdentifyState = {};

interface Props {
  onIdentified: () => void;
}

// Guests can reach every part of checkout (ADR-022), but placing an order
// always requires a session -- this is where that identification happens,
// inline, without navigating away from the cart the customer already built.
export default function CheckoutIdentify({ onIdentified }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [signInState, signInAction, signInPending] = useActionState(checkoutSignIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(checkoutSignUp, initialState);

  const state = isRegister ? signUpState : signInState;
  const action = isRegister ? signUpAction : signInAction;
  const pending = isRegister ? signUpPending : signInPending;

  useEffect(() => {
    if (state.ok) onIdentified();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          {isRegister ? "Create an account" : "Sign in to continue"}
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          {isRegister
            ? "Create an account to place your order — your cart is saved."
            : "Sign in to place your order. Your cart is saved right where you left it."}
        </p>
      </div>

      <form action={action} className="space-y-4">
        {isRegister && (
          <div>
            <Label htmlFor="checkout-name" className="text-sm font-medium text-stone-700">
              Full Name
            </Label>
            <Input id="checkout-name" name="name" required className="mt-1.5" autoComplete="name" />
          </div>
        )}
        <div>
          <Label htmlFor="checkout-email" className="text-sm font-medium text-stone-700">
            Email Address
          </Label>
          <Input
            id="checkout-email"
            name="email"
            type="email"
            required
            className="mt-1.5"
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="checkout-password" className="text-sm font-medium text-stone-700">
            Password
          </Label>
          <Input
            id="checkout-password"
            name="password"
            type="password"
            required
            className="mt-1.5"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-stone-900 hover:bg-amber-700 text-white py-5"
        >
          {pending ? "Please wait…" : isRegister ? "Create Account & Continue" : "Sign In & Continue"}
        </Button>
      </form>

      <p className="text-center text-sm text-stone-500">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="text-amber-600 hover:underline font-medium"
        >
          {isRegister ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}
