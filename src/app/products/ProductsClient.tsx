"use client";

import { useRouter } from "next/navigation";
import { Category } from "@/types";

const categories: Category[] = [
  "All",
  "Kitchen",
  "Bathroom",
  "Storage",
  "Cleaning",
];

interface Props {
  currentCategory: string;
  currentSort: string;
}

export default function ProductsClient({ currentCategory, currentSort }: Props) {
  const router = useRouter();

  const navigate = (category: string, sort: string) => {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (sort !== "default") params.set("sort", sort);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap flex-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(cat, currentSort)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentCategory === cat
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-stone-500 whitespace-nowrap">Sort by</label>
        <select
          value={currentSort}
          onChange={(e) => navigate(currentCategory, e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-700 bg-white focus:outline-none focus:border-stone-400"
        >
          <option value="default">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}
