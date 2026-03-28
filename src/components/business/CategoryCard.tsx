import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CategoryCardProps } from "@/types";
import { getCategoryMeta } from "@/constants";
import { motion } from "framer-motion";

export function CategoryCard({
  id,
  name,
  productCount,
  className,
}: CategoryCardProps) {
  const { icon: Icon, gradient, iconBg } = getCategoryMeta(name);

  return (
    <Link
      to={`/catalog?categories=${encodeURIComponent(name)}`}
      className={cn("group block h-full", className)}
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative overflow-hidden rounded-2xl h-full min-h-[160px]",
          "bg-gradient-to-br", gradient,
          "shadow-md group-hover:shadow-xl transition-shadow"
        )}
      >
        {/* Large faded icon in background */}
        <div className="absolute -right-5 -bottom-5 opacity-15 pointer-events-none">
          <Icon className="w-28 h-28 text-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 flex flex-col justify-between h-full">
          {/* Icon chip */}
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Name + count */}
          <div className="mt-4">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">
              {name}
            </h3>
            <div className="flex items-center justify-between mt-2">
              {productCount !== undefined && (
                <span className="text-xs text-white/70 font-medium">
                  {productCount} produit{productCount !== 1 ? "s" : ""}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all ml-auto" />
            </div>
          </div>
        </div>
      </motion.div>
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
