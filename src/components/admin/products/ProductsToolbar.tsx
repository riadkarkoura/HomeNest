"use client";

import { Search, ChevronDown, Star, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PRODUCT_STATUSES, type ProductStatus } from "./status";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  category: string;
  onCategoryChange: (value: string) => void;
  status: "All" | ProductStatus;
  onStatusChange: (value: "All" | ProductStatus) => void;
  featuredOnly: boolean;
  onFeaturedToggle: () => void;
}

function FilterTrigger({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-400 aria-expanded:border-stone-400">
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
    </button>
  );
}

export default function ProductsToolbar({
  search,
  onSearchChange,
  categories,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  featuredOnly,
  onFeaturedToggle,
}: Props) {
  const hasActiveFilters =
    search !== "" || category !== "All" || status !== "All" || featuredOnly;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search */}
      <div className="relative flex-1 sm:min-w-[240px] sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-9 rounded-full pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Category filter */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<FilterTrigger label={`Category: ${category}`} />} />
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuRadioGroup
              value={category}
              onValueChange={(value) => onCategoryChange(value as string)}
            >
              {categories.map((c) => (
                <DropdownMenuRadioItem key={c} value={c}>
                  {c}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<FilterTrigger label={`Status: ${status}`} />} />
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuRadioGroup
              value={status}
              onValueChange={(value) => onStatusChange(value as "All" | ProductStatus)}
            >
              <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
              {PRODUCT_STATUSES.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {s}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Featured toggle */}
        <button
          onClick={onFeaturedToggle}
          aria-pressed={featuredOnly}
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            featuredOnly
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${featuredOnly ? "fill-amber-400 text-amber-400" : ""}`} />
          Featured
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              onSearchChange("");
              onCategoryChange("All");
              onStatusChange("All");
              if (featuredOnly) onFeaturedToggle();
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-stone-400 transition-colors hover:text-stone-700"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
