import { ShoppingCart, Check, Heart, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { type Product } from "@/data/products";
import { ProductRating } from "./ProductRating";
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

  const isInCart = items.some((item) => item.id === product.id);
  const inWishlist = isInWishlist(product.id);
  // Get primary image
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

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
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="w-full h-full object-cover image-zoom-hover"
              />

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

              {!product.inStock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge className="badge-out-of-stock">{t("badges.outOfStock")}</Badge>
                </div>
              )}
            </div>
          </Link>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1 space-y-3">
              {/* Category */}
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {t(`catalog.categories.${product.category}`)}
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

              {/* Stock indicator */}
              {product.inStock && product.stockQuantity && product.stockQuantity <= 5 && (
                <p className="text-sm text-warning font-medium">
                  {t("productDetails.onlyLeft", { count: product.stockQuantity })}
                </p>
              )}
            </div>

            {/* Price and Actions */}
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Financement disponible</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Payable en plusieurs tranches</p>
              </div>

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
          <img
            src={primaryImage.url}
            alt={primaryImage.alt}
            className="w-full h-full object-cover image-zoom-hover"
          />

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

          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge className="badge-out-of-stock">{t("badges.outOfStock")}</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1">
        <CardContent className="p-5 flex flex-col flex-1">
          {/* Category */}
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
            {t(`catalog.categories.${product.category}`)}
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`} className="mb-3 block">
            <h3 className="font-semibold text-base text-foreground line-clamp-2 hover:text-primary transition-colors min-h-[3rem] leading-6">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating ? (
            <div className="mb-3">
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="sm"
              />
            </div>
          ) : (
            <div className="mb-3 h-5" />
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem] leading-5">
            {product.description}
          </p>

          {/* Stock indicator */}
          {product.inStock && product.stockQuantity && product.stockQuantity <= 5 && (
            <p className="text-xs text-warning font-semibold mb-3">
              {t("productDetails.onlyLeft", { count: product.stockQuantity })}
            </p>
          )}

          {/* Spacer to push price to bottom */}
          <div className="flex-1" />

          {/* Price */}
          <div className="mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Financement disponible</span>
            </div>
            <p className="text-xs text-muted-foreground">Payable en plusieurs tranches</p>
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
