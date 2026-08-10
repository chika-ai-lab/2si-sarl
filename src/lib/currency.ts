import { paymentConfig } from "@/config/payments.config";

/**
 * Format a number as currency based on config
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  const num = Number(amount);
  if (amount === undefined || amount === null || isNaN(num)) {
    return "0";
  }

  const { currencySymbol, currencyPosition, decimalSeparator, thousandSeparator, currency } = paymentConfig;

  // XOF (Franc CFA) doesn't use decimal places
  const decimals = currency === "XOF" ? 0 : 2;

  const formatted = num
    .toFixed(decimals)
    .replace(".", decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  return currencyPosition === "before"
    ? `${currencySymbol}${formatted}`
    : `${formatted} ${currencySymbol}`;
}

/**
 * Calculate monthly payment for a given amount and plan
 */
export function calculateMonthlyPayment(amount: number, planId: string): number {
  const plan = paymentConfig.plans.find(p => p.id === planId);
  if (!plan) return 0;
  
  const interest = amount * (plan.interestRate / 100) * (plan.months / 12);
  const total = amount + interest;
  return total / plan.months;
}

/**
 * Calculate total interest for a given amount and plan
 */
export function calculateInterest(amount: number, planId: string): number {
  const plan = paymentConfig.plans.find(p => p.id === planId);
  if (!plan) return 0;
  
  return amount * (plan.interestRate / 100) * (plan.months / 12);
}

/**
 * Get the minimum monthly payment for display (using longest plan)
 */
export function getMinimumMonthlyPayment(amount: number): number {
  const longestPlan = [...paymentConfig.plans].sort((a, b) => b.months - a.months)[0];
  if (!longestPlan) return amount;

  return calculateMonthlyPayment(amount, longestPlan.id);
}

/**
 * Mensualité d'appel affichée en boutique : la plus petite tranche connue pour
 * un produit, c'est-à-dire celle de la durée la plus longue.
 *
 * On privilégie toujours les mensualités arrêtées par le métier et stockées en
 * base (mensualite_12 / mensualite_24), qui font foi. Le calcul à partir du
 * prix n'est qu'un repli quand aucune mensualité n'a été saisie ; il ne sert
 * qu'à l'affichage, le montant ferme étant celui du devis.
 *
 * Retourne null si ni mensualité ni prix ne sont connus — dans ce cas la carte
 * produit se contente d'annoncer que le financement est possible.
 */
export function getStartingMonthly(product: {
  price?: number;
  mensualite12?: number;
  mensualite24?: number;
}): { amount: number; months: number } | null {
  const known = [
    { amount: product.mensualite24, months: 24 },
    { amount: product.mensualite12, months: 12 },
  ].filter((m): m is { amount: number; months: number } => !!m.amount && m.amount > 0);

  if (known.length > 0) {
    // La plus petite mensualité, donc l'argument d'accessibilité le plus fort.
    return known.reduce((min, m) => (m.amount < min.amount ? m : min));
  }

  const price = product.price ?? 0;
  if (price <= 0) return null;

  const longestPlan = [...paymentConfig.plans].sort((a, b) => b.months - a.months)[0];
  if (!longestPlan) return null;

  return {
    amount: calculateMonthlyPayment(price, longestPlan.id),
    months: longestPlan.months,
  };
}
