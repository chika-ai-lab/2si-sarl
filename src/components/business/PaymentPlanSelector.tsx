import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/I18nProvider";
import { usePaymentConfig } from "@/providers/ConfigProvider";
import { formatCurrency } from "@/lib/currency";

interface PaymentPlanSelectorProps {
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
  amount: number;
}

/**
 * Sélecteur de durée de paiement, compact (une rangée de boutons) pour ne pas
 * imposer de scroll. En boutique le montant n'est pas connu (il est chiffré dans
 * le devis) : on affiche alors uniquement la durée, sans mensualité fictive à
 * « 0 FCFA ». Le détail chiffré n'apparaît que si un montant réel est fourni.
 */
export function PaymentPlanSelector({
  selectedPlanId,
  onPlanChange,
  amount,
}: PaymentPlanSelectorProps) {
  const { t } = useTranslation();
  const paymentConfig = usePaymentConfig();
  const hasAmount = amount > 0;

  const selectedPlan = paymentConfig.plans.find((p) => p.id === selectedPlanId);
  const monthly = selectedPlan
    ? (amount + amount * (selectedPlan.interestRate / 100) * (selectedPlan.months / 12)) / selectedPlan.months
    : 0;
  const total = selectedPlan
    ? amount + amount * (selectedPlan.interestRate / 100) * (selectedPlan.months / 12)
    : amount;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">{t("payment.selectPlan")}</h3>

      <div className="grid grid-cols-3 gap-2">
        {paymentConfig.plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          // En boutique (amount = 0) toutes les durées sont sélectionnables ;
          // les bornes de montant ne s'appliquent que si un prix est connu.
          const isEligible = !hasAmount || (amount >= plan.minAmount && amount <= plan.maxAmount);

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => isEligible && onPlanChange(plan.id)}
              disabled={!isEligible}
              className={cn(
                "relative rounded-xl border-2 py-3 px-2 text-center font-semibold transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/50",
                !isEligible && "opacity-40 cursor-not-allowed",
              )}
            >
              {plan.isPopular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {t("payment.popular")}
                </span>
              )}
              {t(plan.labelKey)}
            </button>
          );
        })}
      </div>

      {hasAmount ? (
        <div className="flex items-baseline justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
          <span className="font-bold text-foreground">
            {formatCurrency(monthly)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {t("payment.monthly")}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            {t("payment.total")} : {formatCurrency(total)}
          </span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Le montant des mensualités sera précisé dans votre devis.
        </p>
      )}
    </div>
  );
}
