import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { products, type Product } from "@/data/products";

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  searchQuery: string;
  sortBy: "name" | "price-asc" | "price-desc" | "rating" | "newest";
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  priceRange: [0, 30000],
  minRating: 0,
  inStockOnly: false,
  searchQuery: "",
  sortBy: "name",
};

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: Partial<FilterState> = {};

    const categories = searchParams.get("categories");
    if (categories) {
      urlFilters.categories = categories.split(",");
    }

    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    if (priceMin || priceMax) {
      urlFilters.priceRange = [
        priceMin ? parseInt(priceMin) : DEFAULT_FILTERS.priceRange[0],
        priceMax ? parseInt(priceMax) : DEFAULT_FILTERS.priceRange[1],
      ];
    }

    const minRating = searchParams.get("minRating");
    if (minRating) {
      urlFilters.minRating = parseInt(minRating);
    }

    const inStockOnly = searchParams.get("inStockOnly");
    if (inStockOnly === "true") {
      urlFilters.inStockOnly = true;
    }

    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      urlFilters.searchQuery = searchQuery;
    }

    const sortBy = searchParams.get("sort");
    if (sortBy && isValidSortOption(sortBy)) {
      urlFilters.sortBy = sortBy as FilterState["sortBy"];
    }

    setFilters({ ...DEFAULT_FILTERS, ...urlFilters });
  }, [searchParams]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    const params = new URLSearchParams();

    if (updatedFilters.categories.length > 0) {
      params.set("categories", updatedFilters.categories.join(","));
    }

    if (
      updatedFilters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
      updatedFilters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]
    ) {
      params.set("priceMin", updatedFilters.priceRange[0].toString());
      params.set("priceMax", updatedFilters.priceRange[1].toString());
    }

    if (updatedFilters.minRating > 0) {
      params.set("minRating", updatedFilters.minRating.toString());
    }

    if (updatedFilters.inStockOnly) {
      params.set("inStockOnly", "true");
    }

    if (updatedFilters.searchQuery) {
      params.set("q", updatedFilters.searchQuery);
    }

    if (updatedFilters.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set("sort", updatedFilters.sortBy);
    }

    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams(new URLSearchParams());
  };

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    // Filter by price range
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filter by rating
    if (filters.minRating > 0) {
      result = result.filter((p) => (p.rating ?? 0) >= filters.minRating);
    }

    // Filter by stock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.reference.toLowerCase().includes(query) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort products
    switch (filters.sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "newest":
        result.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.categories.length > 0) count++;
    if (
      filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
      filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]
    ) {
      count++;
    }
    if (filters.minRating > 0) count++;
    if (filters.inStockOnly) count++;
    if (filters.searchQuery) count++;

    return count;
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    filteredProducts,
    activeFilterCount,
    totalProducts: products.length,
  };
}

function isValidSortOption(value: string): boolean {
  return ["name", "price-asc", "price-desc", "rating", "newest"].includes(value);
}
