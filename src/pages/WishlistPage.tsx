import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEO } from "@/components/SEO";
import { ProductCard } from "@/components/business/ProductCard";
import { useWishlist } from "@/providers/WishlistProvider";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";

export default function WishlistPage() {
  const { items: wishlistIds, clearWishlist } = useWishlist();
  const { products, loading } = useMarketplaceProducts();

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const inStockCount = wishlistProducts.filter((p) => p.inStock).length;

  const handleClearWishlist = () => {
    if (confirm("Êtes-vous sûr de vouloir vider votre liste de favoris ?")) {
      clearWishlist();
    }
  };

  // Empty state
  if (!loading && wishlistIds.length === 0) {
    return (
      <MainLayout>
        <SEO
          title="Liste de favoris"
          description="Votre liste de favoris est vide. Découvrez nos produits."
          noindex={true}
        />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Votre liste de favoris est vide
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Explorez notre catalogue et ajoutez des produits à vos favoris pour les retrouver facilement.
            </p>
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
        description="Gérez vos produits favoris."
        noindex={true}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Mes favoris</h1>
            <p className="text-muted-foreground">
              {loading ? "Chargement..." : `${wishlistProducts.length} produit${wishlistProducts.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {wishlistProducts.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden sm:block">
                <span className="font-semibold text-green-600">{inStockCount}</span> en stock
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearWishlist}
                className="text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider la liste
              </Button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-muted/30 animate-pulse h-72" />
            ))}
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>Les produits sauvegardés ne sont plus disponibles dans le catalogue.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/catalog">Explorer le catalogue</Link>
            </Button>
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistProducts.length > 0 && (
          <div className="text-center py-8 border-t">
            <Button asChild variant="outline" size="lg">
              <Link to="/catalog">
                Continuer mes achats
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
