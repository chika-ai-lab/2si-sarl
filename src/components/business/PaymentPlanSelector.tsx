import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/I18nProvider";
import { usePaymentConfig } from "@/providers/ConfigProvider";
import { formatCurrency } from "@/lib/currency";

interface PaymentPlanSelectorProps {
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
  amount: number;
}

export function PaymentPlanSelector({
  selectedPlanId,
  onPlanChange,
  amount,
}: PaymentPlanSelectorProps) {
  const { t } = useTranslation();
  const paymentConfig = usePaymentConfig();

  const calculateMonthly = (planId: string) => {
    const plan = paymentConfig.plans.find((p) => p.id === planId);
    if (!plan) return 0;
    const interest = amount * (plan.interestRate / 100) * (plan.months / 12);
    return (amount + interest) / plan.months;
  };

  const calculateTotal = (planId: string) => {
    const plan = paymentConfig.plans.find((p) => p.id === planId);
    if (!plan) return amount;
    const interest = amount * (plan.interestRate / 100) * (plan.months / 12);
    return amount + interest;
  };

  const calculateInterest = (planId: string) => {
    const plan = paymentConfig.plans.find((p) => p.id === planId);
    if (!plan) return 0;
    return amount * (plan.interestRate / 100) * (plan.months / 12);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">
        {t("payment.selectPlan")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentConfig.plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const monthly = calculateMonthly(plan.id);
          const total = calculateTotal(plan.id);
          const interest = calculateInterest(plan.id);
          const isEligible = amount >= plan.minAmount && amount <= plan.maxAmount;

          return (
            <button
              key={plan.id}
              onClick={() => isEligible && onPlanChange(plan.id)}
              disabled={!isEligible}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-medium"
                  : "border-border hover:border-primary/50 bg-card",
                !isEligible && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-4">
                  <span className="badge-popular flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {t("payment.popular")}
                  </span>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}

              <div className="space-y-3">
                {/* Plan Title */}
                <div>
                  <div className="font-semibold text-foreground">
                    {t(plan.labelKey)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t(plan.descriptionKey)}
                  </div>
                </div>

                {/* Monthly Payment */}
                <div className="pt-2 border-t border-border/50">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(monthly)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{t("payment.monthly")}
                    </span>
                  </div>
                </div>

                {/* Total & Interest */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>{t("payment.total")}</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  {interest > 0 ? (
                    <div className="flex justify-between">
                      <span>{t("payment.interest")}</span>
                      <span>{formatCurrency(interest)}</span>
                    </div>
                  ) : (
                    <div className="text-success font-medium">
                      {t("payment.noInterest")}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
