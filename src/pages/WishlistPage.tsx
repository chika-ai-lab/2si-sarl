import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEO } from "@/components/SEO";
import { ProductCard } from "@/components/business/ProductCard";
import { useWishlist } from "@/providers/WishlistProvider";
import { useCart } from "@/providers/CartProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { products } from "@/data/products";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const { t } = useTranslation();
  const { items: wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  // Get full product details from wishlist IDs
  const wishlistProducts = products.filter((product) => wishlistIds.includes(product.id));

  const handleAddAllToCart = () => {
    let addedCount = 0;
    wishlistProducts.forEach((product) => {
      if (product.inStock) {
        addItem(product);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast({
        title: "Produits ajoutés au panier",
        description: `${addedCount} produit${addedCount > 1 ? "s" : ""} ajouté${addedCount > 1 ? "s" : ""} au panier.`,
      });
    } else {
      toast({
        title: "Aucun produit disponible",
        description: "Les produits de votre liste de souhaits ne sont pas en stock.",
        variant: "destructive",
      });
    }
  };

  const handleClearWishlist = () => {
    if (confirm("Êtes-vous sûr de vouloir vider votre liste de favoris ?")) {
      clearWishlist();
      toast({
        title: "Liste vidée",
        description: "Votre liste de favoris a été vidée.",
      });
    }
  };

  const totalValue = wishlistProducts.reduce((sum, product) => sum + product.price, 0);
  const inStockCount = wishlistProducts.filter((p) => p.inStock).length;

  // Empty state
  if (wishlistProducts.length === 0) {
    return (
      <MainLayout>
        <SEO
          title="Liste de favoris"
          description="Votre liste de favoris est vide. Découvrez nos produits."
          noindex={true}
        />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Votre liste de favoris est vide
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Explorez notre catalogue et ajoutez des produits à vos favoris pour les retrouver facilement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/catalog">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Explorer le catalogue
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO
        title="Liste de favoris"
        description="Gérez vos produits favoris et ajoutez-les facilement à votre panier."
        noindex={true}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mes favoris
          </h1>
          <p className="text-muted-foreground">
            {wishlistProducts.length} produit{wishlistProducts.length > 1 ? "s" : ""} dans votre liste
          </p>
        </div>

        {/* Stats & Actions Bar */}
        <div className="mb-8 p-6 bg-muted/50 rounded-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total produits</p>
                <p className="text-2xl font-bold text-foreground">
                  {wishlistProducts.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">En stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {inStockCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valeur totale</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider la liste
              </Button>
              <Button
                onClick={handleAddAllToCart}
                disabled={inStockCount === 0}
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Tout ajouter au panier ({inStockCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center py-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Découvrez plus de produits</h2>
          <Button asChild variant="outline" size="lg">
            <Link to="/catalog">
              Continuer mes achats
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
