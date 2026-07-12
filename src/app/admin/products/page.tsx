import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProductsView from "@/components/admin/products/ProductsView";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">Catalogue</p>
          <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500 mt-0.5">Manage your product catalogue.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <ProductsView />
    </div>
  );
}
