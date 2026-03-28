import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, CreditCard, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { CartItem } from "@/components/business/CartItem";
import { SEO } from "@/components/SEO";
import { useCart } from "@/providers/CartProvider";

export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8">
              Ajoutez des produits depuis le catalogue pour faire une demande de devis.
            </p>
            <Link to="/catalog">
              <Button size="lg">
                Explorer le catalogue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <MainLayout>
      <SEO
        title="Panier"
        description="Récapitulatif de votre sélection. Soumettez votre demande pour recevoir un devis personnalisé sous 24h."
        noindex={true}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Votre Panier</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            <div className="pt-4">
              <Link to="/catalog">
                <Button variant="outline" size="lg">
                  Continuer mes achats
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h3 className="font-semibold text-lg">Récapitulatif</h3>

                <div className="text-sm text-muted-foreground">
                  {totalItems} article{totalItems > 1 ? "s" : ""} sélectionné{totalItems > 1 ? "s" : ""}
                </div>

                {/* Info devis */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <CreditCard className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-primary font-medium">
                    Le prix et le plan de paiement (6, 12 ou 24 mois) seront calculés et communiqués dans votre devis sous 24h.
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Le prix final inclut les frais d'expédition selon votre région.
                  </p>
                </div>

                <Link to="/order" className="block pt-2">
                  <Button size="lg" className="w-full">
                    Faire une demande
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground text-center">
                  En continuant, vous acceptez nos conditions générales
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
