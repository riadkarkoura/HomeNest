import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";

export const metadata: Metadata = { title: "Add Product" };

export default function AdminNewProductPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </Link>
        <p className="text-xs uppercase tracking-widest text-amber-600 mt-4 mb-1">Catalogue</p>
        <h1 className="text-2xl font-semibold text-stone-900">Add Product</h1>
        <p className="text-sm text-stone-500 mt-0.5">Create a new product in your catalogue.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
          <PackagePlus className="h-7 w-7 text-stone-400" />
        </div>
        <p className="text-sm font-medium text-stone-900">Product creation coming soon</p>
        <p className="mt-1 text-xs text-stone-400">CRUD operations will be available in a future sprint.</p>
      </div>
    </div>
  );
}
