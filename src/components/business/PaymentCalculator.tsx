import { useState } from "react";
import { Calculator, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PaymentCalculatorProps {
  price: number;
  className?: string;
}

interface PaymentPlan {
  months: number;
  label: string;
  interestRate: number;
  description: string;
}

// Durées et coefficients alignés sur payments.config.ts, source unique du
// financement proposé en boutique.
const PAYMENT_PLANS: PaymentPlan[] = [
  {
    months: 6,
    label: "6 mois",
    interestRate: 0,
    description: "La durée la plus courte",
  },
  {
    months: 12,
    label: "12 mois",
    interestRate: 2.5,
    description: "Le bon équilibre",
  },
  {
    months: 24,
    label: "24 mois",
    interestRate: 4.5,
    description: "La mensualité la plus légère",
  },
];

export function PaymentCalculator({ price, className }: PaymentCalculatorProps) {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>(PAYMENT_PLANS[0]);

  const calculateMonthlyPayment = (plan: PaymentPlan): number => {
    const totalWithInterest = price * (1 + plan.interestRate / 100);
    return totalWithInterest / plan.months;
  };

  const calculateTotalPayment = (plan: PaymentPlan): number => {
    return price * (1 + plan.interestRate / 100);
  };

  const monthlyPayment = calculateMonthlyPayment(selectedPlan);
  const totalPayment = calculateTotalPayment(selectedPlan);

  return (
    <Card className={cn("shadow-medium", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-primary" />
          Calculateur de paiement échelonné
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Selection */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Choisissez votre plan
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_PLANS.map((plan) => {
              const isSelected = selectedPlan.months === plan.months;
              return (
                <button
                  key={plan.months}
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border hover:border-primary/50 hover:bg-secondary/30"
                  )}
                >
                  {/* Selected Checkmark */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-medium">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  <div className="font-semibold text-foreground mb-1">
                    {plan.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {plan.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-secondary/30 rounded-lg p-5 space-y-4">
          {/* Monthly Payment - Highlighted */}
          <div className="bg-primary rounded-lg p-4 text-center">
            <div className="text-sm font-medium text-primary-foreground/80 mb-1">
              Paiement mensuel
            </div>
            <div className="text-3xl font-bold text-primary-foreground">
              {monthlyPayment.toLocaleString("fr-FR")} FCFA
            </div>
            <div className="text-sm text-primary-foreground/70 mt-1">
              pendant {selectedPlan.months} mois
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prix du produit</span>
              <span className="font-medium text-foreground">
                {price.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            {/* Ni taux ni frais affichés : les conditions sont communiquées par
                le chargé de clientèle, jamais annoncées par la vitrine. */}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-foreground">Total à payer</span>
              <span className="font-bold text-foreground">
                {totalPayment.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <span className="text-muted-foreground">Réponse sous 24h</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              Frais de dossier communiqués par votre chargé de clientèle
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <span className="text-muted-foreground">Paiement sécurisé</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
