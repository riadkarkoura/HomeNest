"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AddressForm from "@/components/account/AddressForm";
import type { AddressRow } from "@/lib/supabase/queries/account";

interface Props {
  addresses: AddressRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdded: () => void;
  emptyLabel: string;
}

// Reuses AddressForm as-is (Sprint 7.1) for "add new" -- checkout only
// needs to pick or add an address, never edit/delete inline, so this is
// deliberately a lighter sibling of AddressCard, not a shared component.
export default function CheckoutAddressPicker({
  addresses,
  selectedId,
  onSelect,
  onAdded,
  emptyLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  function handleSaved() {
    setOpen(false);
    onAdded();
  }

  return (
    <div className="space-y-3">
      {addresses.length === 0 && <p className="text-sm text-stone-500">{emptyLabel}</p>}

      {addresses.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`rounded-xl border p-4 text-sm cursor-pointer transition-colors ${
                selectedId === address.id
                  ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name={`address-${emptyLabel}`}
                className="sr-only"
                checked={selectedId === address.id}
                onChange={() => onSelect(address.id)}
              />
              {address.label && <p className="text-xs text-stone-400 mb-0.5">{address.label}</p>}
              <p className="font-medium text-stone-900">
                {address.first_name} {address.last_name}
              </p>
              <p className="text-stone-600">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
              </p>
              <p className="text-stone-600">
                {address.city}
                {address.state ? `, ${address.state}` : ""} {address.postal_code}
              </p>
              <p className="text-stone-600">{address.country_code}</p>
            </label>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" className="gap-2 border-stone-200">
              <Plus className="h-4 w-4" /> Add new address
            </Button>
          }
        />
        <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto">
          <AddressForm address={null} onSaved={handleSaved} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
