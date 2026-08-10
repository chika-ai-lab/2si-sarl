import { ShoppingCart, Check, Heart, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { type Product } from "@/data/products";
import { ProductRating } from "./ProductRating";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatCurrency, getStartingMonthly } from "@/lib/currency";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { cardHoverVariant, bounceBadgeVariant, buttonPressVariant } from "@/lib/animations";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list";
  className?: string;
}

export function ProductCard({ product, variant = "grid", className }: ProductCardProps) {
  const { t } = useTranslation();
  const { items, addItem, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isInCart = items.some((item) => item.id === product.id);
  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const showPlaceholder = !primaryImage?.url || imgError;

  const handleCartAction = async () => {
    setIsAddingToCart(true);

    if (isInCart) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: primaryImage.url,
        category: product.category,
      });
    }

    // Brief animation delay
    setTimeout(() => setIsAddingToCart(false), 300);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  // Calculate discount percentage if on sale
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  if (variant === "list") {
    return (
      <Card className={cn("group overflow-hidden card-elevated-hover", className)}>
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <Link to={`/product/${product.id}`} className="relative md:w-1/3">
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-secondary">
              {showPlaceholder ? (
                <ProductPlaceholder name={product.name} category={product.category} />
              ) : (
                <ProductImage
                  src={primaryImage.url}
                  alt={primaryImage.alt}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover image-zoom-hover"
                />
              )}

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && (
                  <motion.div
                    variants={bounceBadgeVariant}
                    initial="hidden"
                    animate="visible"
                  >
                    <Badge className="badge-new">{t("badges.new")}</Badge>
                  </motion.div>
                )}
                {product.onSale && (
                  <motion.div
                    variants={bounceBadgeVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                  >
                    <Badge className="badge-sale">-{discountPercentage}%</Badge>
                  </motion.div>
                )}
                {product.featured && !product.onSale && !product.isNew && (
                  <motion.div
                    variants={bounceBadgeVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <Badge className="badge-featured">{t("badges.featured")}</Badge>
                  </motion.div>
                )}
              </div>

              {/* Wishlist button */}
              <button
                onClick={handleWishlistToggle}
                className={cn(
                  "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm",
                  "hover:bg-white transition-colors shadow-soft",
                  inWishlist && "text-destructive"
                )}
              >
                <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
              </button>
            </div>
          </Link>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1 space-y-3">
              {/* Category */}
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {product.category}
              </div>

              {/* Title */}
              <Link to={`/product/${product.id}`}>
                <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              {product.rating && (
                <ProductRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  size="sm"
                />
              )}

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {product.description}
              </p>

            </div>

            {/* Price and Actions */}
            <div className="mt-4 flex items-end justify-between gap-4">
              <FinancingPitch product={product} />

              <Button
                onClick={handleCartAction}
                disabled={!product.inStock || isAddingToCart}
                variant={isInCart ? "secondary" : "default"}
                size="lg"
                className="shrink-0"
              >
                {isInCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    Au panier
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <motion.div
      variants={cardHoverVariant}
      initial="rest"
      whileHover="hover"
      className={cn("h-full", className)}
    >
      <Card className="group overflow-hidden card-elevated-hover flex flex-col h-full">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block flex-shrink-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {showPlaceholder ? (
            <ProductPlaceholder name={product.name} category={product.category} />
          ) : (
            <ProductImage
              src={primaryImage.url}
              alt={primaryImage.alt}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover image-zoom-hover"
            />
          )}

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <motion.div
                variants={bounceBadgeVariant}
                initial="hidden"
                animate="visible"
              >
                <Badge className="badge-new">{t("badges.new")}</Badge>
              </motion.div>
            )}
            {product.onSale && (
              <motion.div
                variants={bounceBadgeVariant}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <Badge className="badge-sale">-{discountPercentage}%</Badge>
              </motion.div>
            )}
            {product.featured && !product.onSale && !product.isNew && (
              <motion.div
                variants={bounceBadgeVariant}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <Badge className="badge-featured">{t("badges.featured")}</Badge>
              </motion.div>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm",
              "hover:bg-white transition-all shadow-soft hover:scale-110",
              inWishlist && "text-destructive"
            )}
            aria-label={inWishlist ? t("productDetails.removeFromWishlist") : t("productDetails.addToWishlist")}
          >
            <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
          </button>
        </div>
      </Link>

      <div className="flex flex-col flex-1">
        <CardContent className="p-5 flex flex-col gap-2">
          {/* Category */}
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {product.category}
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-base text-foreground line-clamp-2 hover:text-primary transition-colors leading-6">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && (
            <ProductRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-5">
            {product.description}
          </p>

          {/* Financement — mensualité d'appel */}
          <div className="pt-2 border-t border-border">
            <FinancingPitch product={product} />
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <motion.div
            variants={buttonPressVariant}
            whileTap="tap"
            className="w-full"
          >
            <Button
              onClick={handleCartAction}
              disabled={!product.inStock || isAddingToCart}
              variant={isInCart ? "secondary" : "default"}
              className="w-full"
            >
              {isInCart ? (
                <>
                  <Check className="h-4 w-4" />
                  {t("product.removeFromCart")}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {t("product.addToCart")}
                </>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </div>
    </Card>
    </motion.div>
  );
}

function BankBadge({ banque, className }: { banque: string; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[10px] px-1.5 py-0 shrink-0",
        banque === "CBAO" && "bg-blue-100 text-blue-800 border-blue-200",
        banque === "CMS" && "bg-red-100 text-red-800 border-red-200",
        className
      )}
    >
      {banque}
    </Badge>
  );
}

/**
 * Argument de vente principal de la carte : la plus petite mensualité connue,
 * mise en avant plutôt que le prix comptant. Quand aucune mensualité n'est
 * disponible on annonce seulement que le produit est finançable — jamais un
 * montant inventé, le chiffre ferme restant celui du devis.
 */
function FinancingPitch({ product }: { product: Product }) {
  const { t } = useTranslation();
  const starting = getStartingMonthly(product);

  if (!starting) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <CreditCard className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold text-primary">
          {product.banque
            ? t("product.financingWith", { bank: product.banque })
            : t("product.financingAvailable")}
        </span>
        {product.banque && <BankBadge banque={product.banque} className="ml-auto" />}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-2 flex-1 min-w-0">
      <div className="min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t("product.startingFrom")}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary leading-tight">
            {formatCurrency(starting.amount)}
          </span>
          <span className="text-sm font-semibold text-primary/80">
            {t("product.perMonth")}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t("product.overMonths", { months: starting.months })}
        </p>
      </div>
      {product.banque && <BankBadge banque={product.banque} />}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  "Informatique":    "from-blue-500/20 to-blue-600/10",
  "Mobilier":        "from-amber-500/20 to-amber-600/10",
  "Équipement":      "from-emerald-500/20 to-emerald-600/10",
  "Véhicules":       "from-slate-500/20 to-slate-600/10",
  "Outillage":       "from-orange-500/20 to-orange-600/10",
  "Énergie":         "from-yellow-500/20 to-yellow-600/10",
  "Sécurité":        "from-red-500/20 to-red-600/10",
  "Électronique":    "from-violet-500/20 to-violet-600/10",
};

function ProductPlaceholder({ name, category }: { name: string; category: string }) {
  const gradient = CATEGORY_COLORS[category] ?? "from-primary/15 to-primary/5";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3 select-none`}>
      <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center shadow-sm">
        <Package className="w-7 h-7 text-primary/60" />
      </div>
      <span className="text-xs font-semibold text-primary/50 tracking-widest uppercase">
        {initials || category}
      </span>
    </div>
  );
}
