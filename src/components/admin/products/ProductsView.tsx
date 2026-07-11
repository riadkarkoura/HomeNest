"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";
import ProductsToolbar from "./ProductsToolbar";
import ProductsTable from "./ProductsTable";
import { getProductStatus, type ProductStatus } from "./status";

interface Props {
  products: Product[];
}

export default function ProductsView({ products }: Props) {
  // Simulated fetch delay — there is no live data source yet (static
  // `products` array), but the loading UI is built now so it's ready to
  // wire to a real Supabase read in the CRUD sprint.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"All" | ProductStatus>("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (category !== "All" && product.category !== category) return false;
      if (status !== "All" && getProductStatus(product) !== status) return false;
      if (featuredOnly && !product.featured) return false;
      return true;
    });
  }, [products, search, category, status, featuredOnly]);

  const filtersActive =
    search !== "" || category !== "All" || status !== "All" || featuredOnly;

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStatus("All");
    setFeaturedOnly(false);
  };

  return (
    <div className="space-y-4">
      <ProductsToolbar
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        featuredOnly={featuredOnly}
        onFeaturedToggle={() => setFeaturedOnly((v) => !v)}
      />
      <ProductsTable
        products={filtered}
        loading={loading}
        filtersActive={filtersActive}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
