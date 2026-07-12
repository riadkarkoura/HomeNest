import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ProductStudio from "@/components/admin/products/studio/ProductStudio";
import { getAdminProductForEdit } from "@/lib/supabase/queries/admin-product";
import { updateProduct } from "./actions";

export const metadata: Metadata = { title: "Edit Product" };

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialDraft = await getAdminProductForEdit(id);

  if (!initialDraft) notFound();

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
        <h1 className="text-2xl font-semibold text-stone-900">Edit Product</h1>
        <p className="text-sm text-stone-500 mt-0.5">{initialDraft.title}</p>
      </div>

      <ProductStudio initialDraft={initialDraft} action={updateProduct.bind(null, id)} />
    </div>
  );
}
