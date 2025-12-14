import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { X, Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/providers/I18nProvider";
import { type FilterState } from "@/hooks/useProductFilters";
import { cn } from "@/lib/utils";
import { CategoryChip } from "./CategoryCard";

interface ProductFiltersProps {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  minPrice: number;
  maxPrice: number;
  className?: string;
}

const categories = [
  "informatique",
  "mobilier",
  "equipement",
  "vehicule",
  "outillage",
] as const;

const ratingOptions = [
  { value: 4, label: "4+ étoiles" },
  { value: 3, label: "3+ étoiles" },
  { value: 2, label: "2+ étoiles" },
  { value: 1, label: "1+ étoile" },
];

export function ProductFilters({
  filters,
  updateFilters,
  clearFilters,
  activeFilterCount,
  minPrice,
  maxPrice,
  className,
}: ProductFiltersProps) {
  const { t } = useTranslation();

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const handlePriceRangeChange = (values: number[]) => {
    updateFilters({ priceRange: [values[0], values[1]] });
  };

  const handleRatingChange = (rating: number) => {
    updateFilters({ minRating: filters.minRating === rating ? 0 : rating });
  };

  const handleStockToggle = () => {
    updateFilters({ inStockOnly: !filters.inStockOnly });
  };

  return (
    <div className={cn("filter-section", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Filtres</h3>
          {activeFilterCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {activeFilterCount} filtre{activeFilterCount > 1 ? "s" : ""} actif{activeFilterCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Tout effacer
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price", "rating", "stock"]} className="w-full">
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-3">
              <span className="font-medium">Catégories</span>
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.categories.length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {categories.map((category) => {
                const isChecked = filters.categories.includes(category);
                return (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={`category-${category}`}
                      checked={isChecked}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <CategoryChip category={category} />
                    </Label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-3">
              <span className="font-medium">Prix</span>
              {(filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) && (
                <Badge variant="secondary" className="ml-2">
                  ✓
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                min={minPrice}
                max={maxPrice}
                step={100}
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formatCurrency(filters.priceRange[0])}</span>
                <span className="text-muted-foreground">-</span>
                <span className="font-medium">{formatCurrency(filters.priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="rating">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-3">
              <span className="font-medium">Note minimum</span>
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="ml-2">
                  ✓
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {ratingOptions.map((option) => {
                const isSelected = filters.minRating === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleRatingChange(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left",
                      isSelected
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < option.value ? "rating-star-filled fill-current" : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stock */}
        <AccordionItem value="stock">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-3">
              <span className="font-medium">Disponibilité</span>
              {filters.inStockOnly && (
                <Badge variant="secondary" className="ml-2">
                  ✓
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStockOnly}
                  onCheckedChange={handleStockToggle}
                />
                <Label htmlFor="in-stock" className="cursor-pointer">
                  En stock seulement
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
