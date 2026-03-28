import { useState } from "react";
import { Search, Grid3X3, List, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductCard } from "@/components/business/ProductCard";
import { ProductFilters } from "@/components/business/ProductFilters";
import { MobileFilters } from "@/components/business/MobileFilters";
import { PromoPageBanner } from "@/components/promo/PromoPageBanner";
import { SEO } from "@/components/SEO";
import { useTranslation } from "@/providers/I18nProvider";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { Link } from "react-router-dom";

export default function CatalogPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { products: apiProducts, categories: apiCategories, loading: apiLoading } = useMarketplaceProducts();

  const {
    filters,
    updateFilters,
    clearFilters,
    filteredProducts,
    activeFilterCount,
    totalProducts,
  } = useProductFilters(apiProducts);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sortBy: value as typeof filters.sortBy });
  };

  return (
    <MainLayout>
      <SEO
        title="Catalogue"
        description="Parcourez notre large catalogue d'équipements professionnels avec paiement échelonné. Bureaux, informatique, mobilier et bien plus encore."
        keywords="catalogue équipement, matériel professionnel, bureau, informatique, mobilier, paiement échelonné"
      />
      {/* Header with Breadcrumb */}
      <section className="bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Catalogue</span>
          </nav>

          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t("catalog.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("catalog.subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop only */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <ProductFilters
                  filters={filters}
                  updateFilters={updateFilters}
                  clearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                  apiCategories={apiCategories}
                />
              </div>
            </aside>

            {/* Products Section */}
            <div className="flex-1 min-w-0">
              {/* Promo Banner (if promo code in URL) */}
              <PromoPageBanner />

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Left: Search + Mobile Filters */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Filters */}
                  <div className="lg:hidden">
                    <MobileFilters
                      filters={filters}
                      updateFilters={updateFilters}
                      clearFilters={clearFilters}
                      activeFilterCount={activeFilterCount}
                      minPrice={0}
                      maxPrice={0}
                      filteredCount={filteredProducts.length}
                      totalCount={totalProducts}
                      apiCategories={apiCategories}
                    />
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher..."
                      value={filters.searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Right: Results + Sort + View */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Results Count */}
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredProducts.length} / {totalProducts} produit
                    {filteredProducts.length !== 1 ? "s" : ""}
                  </div>

                  {/* Sort */}
                  <Select
                    value={filters.sortBy}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nom</SelectItem>
                      <SelectItem value="price-asc">Prix croissant</SelectItem>
                      <SelectItem value="price-desc">
                        Prix décroissant
                      </SelectItem>
                      <SelectItem value="rating">Mieux notés</SelectItem>
                      <SelectItem value="newest">Nouveautés</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="hidden sm:flex gap-1 border border-border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="h-8 w-8"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="h-8 w-8"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {apiLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-muted/30 animate-pulse h-72" />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={viewMode === "grid" ? "animate-fade-in h-full" : "animate-fade-in"}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <ProductCard product={product} variant={viewMode} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche ou filtres
                  </p>
                  {activeFilterCount > 0 && (
                    <Button onClick={clearFilters} variant="outline">
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
