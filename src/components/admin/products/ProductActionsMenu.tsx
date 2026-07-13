"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Copy, Archive, ArchiveRestore, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/types";
import { archiveProduct, deleteProduct, duplicateProduct, restoreProduct } from "@/app/admin/products/actions";
import { getProductStatus } from "./status";

interface Props {
  product: Product;
  onChanged: () => void;
}

// Edit (Sprint 7.1) links to the Studio. View, Duplicate, Archive/Restore,
// Delete (Sprint 6.1 remaining) call the Server Actions in
// src/app/admin/products/actions.ts directly — no dedicated admin
// "view product" page exists, so View opens the already-built storefront
// page instead of duplicating it into a new admin surface.
export default function ProductActionsMenu({ product, onChanged }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const status = getProductStatus(product);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"? This removes it from the storefront and admin list.`)) {
      return;
    }
    setPending(true);
    const result = await deleteProduct(product.id);
    setPending(false);
    if (!result.ok) {
      window.alert(result.message ?? "Something went wrong deleting this product.");
      return;
    }
    onChanged();
  };

  const handleArchive = async () => {
    setPending(true);
    const result = await archiveProduct(product.id);
    setPending(false);
    if (!result.ok) {
      window.alert(result.message ?? "Something went wrong archiving this product.");
      return;
    }
    onChanged();
  };

  const handleRestore = async () => {
    setPending(true);
    const result = await restoreProduct(product.id);
    setPending(false);
    if (!result.ok) {
      window.alert(result.message ?? "Something went wrong restoring this product.");
      return;
    }
    onChanged();
  };

  const handleDuplicate = async () => {
    setPending(true);
    try {
      const result = await duplicateProduct(product.id);
      setPending(false);
      if (!result.ok || !result.id) {
        window.alert(result.message ?? "Something went wrong duplicating this product.");
        return;
      }
      router.push(`/admin/products/${result.id}/edit`);
    } catch (err) {
      setPending(false);
      console.error("[handleDuplicate] unexpected error", err);
      window.alert("Something went wrong duplicating this product.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label={`Actions for ${product.name}`}
            disabled={pending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
          />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem render={<Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" />}>
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/admin/products/${product.id}/edit`} />}>
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status === "Active" && (
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}
        {status === "Archived" && (
          <DropdownMenuItem onClick={handleRestore}>
            <ArchiveRestore className="h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
