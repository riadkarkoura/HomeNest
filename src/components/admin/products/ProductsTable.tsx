"use client";

import Image from "next/image";
import { PackageSearch, Star } from "lucide-react";
import type { Product } from "@/types";
import ProductActionsMenu from "./ProductActionsMenu";
import { getProductStatus, STATUS_STYLES } from "./status";

interface Props {
  products: Product[];
  loading: boolean;
  filtersActive: boolean;
  onClearFilters: () => void;
  onProductChanged: () => void;
}

const SKELETON_ROWS = 6;

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="h-11 w-11 animate-pulse rounded-lg bg-stone-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-40 animate-pulse rounded bg-stone-100" />
      </td>
      <td className="hidden px-6 py-4 sm:table-cell">
        <div className="h-3.5 w-16 animate-pulse rounded bg-stone-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-10 animate-pulse rounded bg-stone-100" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-14 animate-pulse rounded-full bg-stone-100" />
      </td>
      <td className="hidden px-6 py-4 lg:table-cell">
        <div className="h-3.5 w-5 animate-pulse rounded bg-stone-100" />
      </td>
      <td className="hidden px-6 py-4 md:table-cell">
        <div className="h-3.5 w-14 animate-pulse rounded bg-stone-100" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="ml-auto h-8 w-8 animate-pulse rounded-lg bg-stone-100" />
      </td>
    </tr>
  );
}

export default function ProductsTable({ products, loading, filtersActive, onClearFilters, onProductChanged }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-stone-400">
              <th className="px-6 py-3">
                <span className="sr-only">Image</span>
              </th>
              <th className="px-6 py-3">Product</th>
              <th className="hidden px-6 py-3 sm:table-cell">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="hidden px-6 py-3 lg:table-cell">Featured</th>
              <th className="hidden px-6 py-3 md:table-cell">Stock</th>
              <th className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading &&
              Array.from({ length: SKELETON_ROWS }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading &&
              products.map((product) => {
                const status = getProductStatus(product);
                return (
                  <tr key={product.id} className="transition-colors hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-[220px] truncate text-sm font-medium text-stone-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-stone-400 sm:hidden">{product.category}</p>
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-stone-500 sm:table-cell">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-stone-900">
                      ${product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 lg:table-cell">
                      {product.featured && (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="Featured" />
                      )}
                    </td>
                    <td className="hidden px-6 py-4 text-sm md:table-cell">
                      <span className={product.inStock ? "text-stone-600" : "text-stone-400"}>
                        {product.inStock ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ProductActionsMenu product={product} onChanged={onProductChanged} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
            <PackageSearch className="h-7 w-7 text-stone-400" />
          </div>
          <p className="text-sm font-medium text-stone-900">No products found</p>
          <p className="mt-1 text-xs text-stone-400">
            {filtersActive
              ? "Try adjusting your search or filters."
              : "Your catalogue is empty."}
          </p>
          {filtersActive && (
            <button
              onClick={onClearFilters}
              className="mt-4 text-xs font-medium text-amber-600 transition-colors hover:text-amber-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
