"use client";

import { useState } from "react";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { deleteAddress, setDefaultAddress } from "@/app/account/addresses/actions";
import type { AddressRow } from "@/lib/supabase/queries/account";

interface Props {
  address: AddressRow;
  onEdit: () => void;
  onChanged: () => void;
}

export default function AddressCard({ address, onEdit, onChanged }: Props) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this address?")) return;
    setPending(true);
    const result = await deleteAddress(address.id);
    setPending(false);
    if (!result.ok) {
      window.alert(result.message ?? "Something went wrong deleting this address.");
      return;
    }
    onChanged();
  }

  async function handleSetDefault() {
    setPending(true);
    const result = await setDefaultAddress(address.id, address.type);
    setPending(false);
    if (!result.ok) {
      window.alert(result.message ?? "Something went wrong setting this as your default address.");
      return;
    }
    onChanged();
  }

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-5 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-stone-400" />
          <span className="text-xs uppercase tracking-wider text-stone-400">{address.type}</span>
          {address.is_default && (
            <span className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">Default</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            disabled={pending}
            className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-40"
            aria-label="Edit address"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="p-1.5 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-40"
            aria-label="Delete address"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {address.label && <p className="text-xs text-stone-400">{address.label}</p>}
      <p className="text-sm font-medium text-stone-900">
        {address.first_name} {address.last_name}
      </p>
      {address.company && <p className="text-sm text-stone-500">{address.company}</p>}
      <p className="text-sm text-stone-600">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p className="text-sm text-stone-600">
        {address.city}
        {address.state ? `, ${address.state}` : ""} {address.postal_code}
      </p>
      <p className="text-sm text-stone-600">{address.country_code}</p>

      {!address.is_default && (
        <button
          onClick={handleSetDefault}
          disabled={pending}
          className="text-xs text-amber-600 hover:underline font-medium mt-1 disabled:opacity-40"
        >
          Set as default
        </button>
      )}
    </div>
  );
}
