import { useState } from "react";
import { ArrowRight, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CategoryCardProps } from "@/types";
import { categoryIcons, getCategoryMeta, getCategoryImageCandidates } from "@/constants";
import { motion } from "framer-motion";

export function CategoryCard({
  id,
  name,
  productCount,
  className,
}: CategoryCardProps) {
  const { icon: Icon, gradient, iconBg } = getCategoryMeta(name);

  // Le nom de fichier peut diverger du libellé sur le pluriel : on essaie les
  // candidats dans l'ordre, chaque échec passant au suivant. Une fois la liste
  // épuisée, le dégradé de couleur reprend la main.
  const candidates = getCategoryImageCandidates(name);
  const [attempt, setAttempt] = useState(0);
  const image = candidates[attempt];

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
        {image ? (
          <>
            {/* object-cover : la photo remplit la carte sans jamais se déformer,
                quel que soit son ratio d'origine. */}
            <img
              src={image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              width={640}
              height={480}
              onError={() => setAttempt((i) => i + 1)}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {/* Voile sombre : le texte blanc doit rester lisible sur n'importe
                quelle photo, y compris les zones claires. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
          </>
        ) : (
          /* Sans visuel, on garde la grande icône estompée d'origine. */
          <div className="absolute -right-5 -bottom-5 opacity-15 pointer-events-none">
            <Icon className="w-28 h-28 text-white" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-5 flex flex-col justify-between h-full">
          {/* Icon chip — flouté par-dessus la photo pour rester détaché du fond */}
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center",
              image ? "bg-white/20 backdrop-blur-sm ring-1 ring-white/25" : iconBg
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Name + count */}
          <div className="mt-4">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-sm">
              {name}
            </h3>
            <div className="flex items-center justify-between mt-2">
              {productCount !== undefined && (
                <span className="text-xs text-white/80 font-medium">
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
