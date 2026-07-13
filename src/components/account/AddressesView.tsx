"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import type { AddressRow } from "@/lib/supabase/queries/account";

interface Props {
  addresses: AddressRow[];
}

export default function AddressesView({ addresses }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AddressRow | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setEditing(null);
  }

  function handleSaved() {
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  function handleChanged() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">Saved Addresses</h2>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger
            render={
              <Button
                className="bg-stone-900 hover:bg-amber-700 text-white gap-2"
                onClick={() => setEditing(null)}
              >
                <Plus className="h-4 w-4" /> Add Address
              </Button>
            }
          />
          <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto">
            <AddressForm address={editing} onSaved={handleSaved} />
          </SheetContent>
        </Sheet>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-24 text-center">
          <p className="text-sm font-medium text-stone-900">No saved addresses yet</p>
          <p className="mt-1 text-xs text-stone-400">Add one to speed up checkout next time.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => {
                setEditing(address);
                setOpen(true);
              }}
              onChanged={handleChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
