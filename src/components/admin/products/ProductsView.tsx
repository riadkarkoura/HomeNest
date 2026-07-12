"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";
import ProductsToolbar from "./ProductsToolbar";
import ProductsTable from "./ProductsTable";
import ProductsPagination from "./ProductsPagination";
import type { ProductStatus } from "./status";
import {
  getAdminProducts,
  getAdminCategories,
  type AdminCategory,
} from "@/lib/supabase/queries/admin-products";

const PAGE_SIZE = 20;

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"All" | ProductStatus>("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(0);

  // Debounce search input so we don't fire a query per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Any filter change resets pagination to the first page.
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, category, status, featuredOnly]);

  useEffect(() => {
    getAdminCategories().then(setCategories);
  }, []);

  const categoryId = useMemo(
    () => categories.find((c) => c.name === category)?.id,
    [categories, category]
  );

  useEffect(() => {
    // A specific category is selected but categories haven't resolved yet —
    // wait rather than fetching unfiltered results for a moment.
    if (category !== "All" && !categoryId) return;

    let cancelled = false;
    setLoading(true);

    getAdminProducts({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
      categoryId,
      status: status === "All" ? undefined : status,
      featuredOnly,
    }).then(({ products, totalCount }) => {
      if (cancelled) return;
      setProducts(products);
      setTotalCount(totalCount);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, category, categoryId, status, featuredOnly]);

  const categoryNames = useMemo(
    () => ["All", ...categories.map((c) => c.name).sort()],
    [categories]
  );

  const filtersActive = search !== "" || category !== "All" || status !== "All" || featuredOnly;

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStatus("All");
    setFeaturedOnly(false);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <ProductsToolbar
        search={search}
        onSearchChange={setSearch}
        categories={categoryNames}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        featuredOnly={featuredOnly}
        onFeaturedToggle={() => setFeaturedOnly((v) => !v)}
      />
      <ProductsTable
        products={products}
        loading={loading}
        filtersActive={filtersActive}
        onClearFilters={clearFilters}
      />
      <ProductsPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
