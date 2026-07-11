import type { Metadata } from "next";
import { getProducts } from "@/lib/supabase/queries/products";
import ProductCard from "@/components/shop/ProductCard";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Discover smart home solutions that solve real household problems — kitchen, bathroom, storage and more.",
};

interface Props {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category = "All", sort = "default" } = await searchParams;
  const filtered = await getProducts({ category, sort });

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">Our Solutions</p>
          <h1 className="text-3xl sm:text-4xl font-light text-stone-900">
            All <span className="font-semibold">Products</span>
          </h1>
          <p className="text-stone-500 mt-2">{filtered.length} solutions available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsClient currentCategory={category} currentSort={sort} />

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-stone-400">
            <p className="text-lg font-medium">No products in this category yet</p>
            <a href="/products" className="text-amber-600 text-sm mt-2 inline-block hover:underline">
              View all products
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
