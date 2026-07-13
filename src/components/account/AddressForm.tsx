"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAddress, updateAddress, type AddressFormState } from "@/app/account/addresses/actions";
import type { AddressRow } from "@/lib/supabase/queries/account";

interface Props {
  address: AddressRow | null;
  onSaved: () => void;
}

const initialState: AddressFormState = {};

export default function AddressForm({ address, onSaved }: Props) {
  const action = address ? updateAddress.bind(null, address.id) : createAddress;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-stone-900">{address ? "Edit Address" : "Add Address"}</h3>

      <div>
        <Label htmlFor="type" className="text-sm font-medium text-stone-700">
          Type
        </Label>
        <select
          id="type"
          name="type"
          defaultValue={address?.type ?? "shipping"}
          className="mt-1.5 flex h-9 w-full rounded-lg border border-stone-200 bg-transparent px-3 text-sm text-stone-900 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="shipping">Shipping</option>
          <option value="billing">Billing</option>
        </select>
      </div>

      <div>
        <Label htmlFor="label" className="text-sm font-medium text-stone-700">
          Label <span className="text-stone-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="label"
          name="label"
          defaultValue={address?.label ?? ""}
          placeholder="Home, Work…"
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-stone-700">
            First Name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={address?.first_name ?? ""}
            required
            className="mt-1.5"
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-stone-700">
            Last Name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={address?.last_name ?? ""}
            required
            className="mt-1.5"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="company" className="text-sm font-medium text-stone-700">
          Company <span className="text-stone-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="company"
          name="company"
          defaultValue={address?.company ?? ""}
          className="mt-1.5"
          autoComplete="organization"
        />
      </div>

      <div>
        <Label htmlFor="line1" className="text-sm font-medium text-stone-700">
          Address Line 1
        </Label>
        <Input
          id="line1"
          name="line1"
          defaultValue={address?.line1 ?? ""}
          required
          className="mt-1.5"
          autoComplete="address-line1"
        />
      </div>

      <div>
        <Label htmlFor="line2" className="text-sm font-medium text-stone-700">
          Address Line 2 <span className="text-stone-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="line2"
          name="line2"
          defaultValue={address?.line2 ?? ""}
          className="mt-1.5"
          autoComplete="address-line2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-sm font-medium text-stone-700">
            City
          </Label>
          <Input
            id="city"
            name="city"
            defaultValue={address?.city ?? ""}
            required
            className="mt-1.5"
            autoComplete="address-level2"
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-sm font-medium text-stone-700">
            State <span className="text-stone-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="state"
            name="state"
            defaultValue={address?.state ?? ""}
            className="mt-1.5"
            autoComplete="address-level1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode" className="text-sm font-medium text-stone-700">
            Postal Code
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            defaultValue={address?.postal_code ?? ""}
            required
            className="mt-1.5"
            autoComplete="postal-code"
          />
        </div>
        <div>
          <Label htmlFor="countryCode" className="text-sm font-medium text-stone-700">
            Country Code
          </Label>
          <Input
            id="countryCode"
            name="countryCode"
            defaultValue={address?.country_code ?? "US"}
            placeholder="US"
            maxLength={2}
            required
            className="mt-1.5 uppercase"
            autoComplete="country"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-stone-700">
          Phone <span className="text-stone-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={address?.phone ?? ""}
          className="mt-1.5"
          autoComplete="tel"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-stone-900 hover:bg-amber-700 text-white"
      >
        {pending ? "Saving…" : "Save Address"}
      </Button>
    </form>
  );
}
