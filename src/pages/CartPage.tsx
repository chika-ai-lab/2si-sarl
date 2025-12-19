import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { CartItem } from "@/components/business/CartItem";
import { PaymentPlanSelector } from "@/components/business/PaymentPlanSelector";
import { SEO } from "@/components/SEO";
import { useCart } from "@/providers/CartProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { formatCurrency } from "@/lib/currency";

export default function CartPage() {
  const { t } = useTranslation();
  const {
    items,
    selectedPlanId,
    setPaymentPlan,
    getSubtotal,
    getTotal,
    getMonthlyPayment,
    getInterest,
    getSelectedPlan,
  } = useCart();

  const subtotal = getSubtotal();
  const total = getTotal();
  const monthly = getMonthlyPayment();
  const interest = getInterest();
  const plan = getSelectedPlan();

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("cart.empty")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t("cart.emptyDescription")}
            </p>
            <Link to="/catalog">
              <Button size="lg">
                {t("cart.browseCatalog")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO
        title="Panier"
        description="Finalisez votre commande d'équipements professionnels avec nos options de paiement échelonné flexibles."
        keywords="panier, commande, checkout, paiement échelonné"
        noindex={true}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          {t("cart.title")}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link to="/catalog">
                <Button variant="outline" size="lg">
                  {t("cart.continue")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Payment Plan Selection */}
              <div className="bg-card rounded-xl border border-border p-6">
                <PaymentPlanSelector
                  selectedPlanId={selectedPlanId}
                  onPlanChange={setPaymentPlan}
                  amount={subtotal}
                />
              </div>

              {/* Order Summary */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-lg text-foreground">
                  {t("order.summary")}
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("cart.subtotal")}
                    </span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {interest > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("payment.interest")} ({plan?.interestRate}%)
                      </span>
                      <span className="text-foreground">
                        {formatCurrency(interest)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">
                        {t("cart.total")}
                      </span>
                      <span className="font-bold text-xl text-foreground">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    {plan && (
                      <div className="text-right text-sm text-muted-foreground mt-1">
                        soit {formatCurrency(monthly)}/{t("payment.monthly")} × {plan.months}
                      </div>
                    )}
                  </div>
                </div>

                <Link to="/order" className="block pt-2">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white">
                    {t("cart.checkout")}
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
