import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import { ProductFilters } from "./ProductFilters";
import { type FilterState } from "@/hooks/useProductFilters";
import { useState } from "react";

interface MobileFiltersProps {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  minPrice: number;
  maxPrice: number;
  filteredCount: number;
  totalCount: number;
}

export function MobileFilters({
  filters,
  updateFilters,
  clearFilters,
  activeFilterCount,
  minPrice,
  maxPrice,
  filteredCount,
  totalCount,
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
        </SheetHeader>

        <div className="py-6">
          <ProductFilters
            filters={filters}
            updateFilters={updateFilters}
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>

        <SheetFooter className="sticky bottom-0 bg-background pt-4 border-t mt-6">
          <div className="flex flex-col w-full gap-3">
            <div className="text-sm text-muted-foreground text-center">
              {filteredCount} produit{filteredCount > 1 ? "s" : ""} sur {totalCount}
            </div>
            <Button onClick={handleApplyFilters} size="lg" className="w-full">
              Appliquer les filtres
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
