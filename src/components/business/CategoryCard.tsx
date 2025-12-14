import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CategoryCardProps } from "@/types";
import { categoryIcons } from "@/constants";

export function CategoryCard({
  id,
  name,
  productCount,
  className,
}: CategoryCardProps) {
  const Icon = categoryIcons[id] || Settings;

  return (
    <Link
      to={`/catalog?category=${id}`}
      className={cn(
        "group card-elevated-hover rounded-lg p-6 transition-all h-full overflow-hidden min-h-[170px] flex items-center justify-center",
        "hover:border-primary/20",
        className
      )}
    >
      <div className="flex flex-col items-center text-center gap-4 w-full">
        {/* Icon container */}
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Icon className="w-8 h-8 text-primary" />
        </div>

        {/* Category name */}
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>

          {productCount !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {productCount} produit{productCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact variant for smaller displays
interface CategoryChipProps {
  id: string;
  name: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({
  id,
  name,
  isActive,
  onClick,
  className,
}: CategoryChipProps) {
  const Icon = categoryIcons[id] || Settings;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "border transition-all font-medium text-sm",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-soft"
          : "bg-card border-border hover:border-primary/50 hover:bg-primary/5",
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{name}</span>
    </button>
  );
}
