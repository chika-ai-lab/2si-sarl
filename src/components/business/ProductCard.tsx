import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/providers/CartProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { formatCurrency, getMinimumMonthlyPayment } from "@/lib/currency";
import { type Product } from "@/data/products";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { items, addItem, removeItem } = useCart();
  
  const isInCart = items.some((item) => item.id === product.id);
  const monthlyPayment = getMinimumMonthlyPayment(product.price);

  const handleCartAction = () => {
    if (isInCart) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
  };

  return (
    <Card className="group overflow-hidden card-hover border-border/50 bg-card">
      {/* Image */}
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                {t("product.outOfStock")}
              </Badge>
            </div>
          )}
          {product.featured && product.inStock && (
            <Badge className="absolute top-3 left-3 badge-popular">
              Featured
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        {/* Category & Reference */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-wide">{t(`catalog.categories.${product.category}`)}</span>
          <span>{t("product.reference")} {product.reference}</span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="pt-2">
          <div className="text-xl font-bold text-foreground">
            {formatCurrency(product.price)}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("product.fromPerMonth", { amount: formatCurrency(monthlyPayment) })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleCartAction}
          disabled={!product.inStock}
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
      </CardFooter>
    </Card>
  );
}
