import { paymentConfig } from "@/config/payments.config";

/**
 * Format a number as currency based on config
 */
export function formatCurrency(amount: number | undefined | null): string {
  // Handle undefined/null values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "0";
  }

  const { currencySymbol, currencyPosition, decimalSeparator, thousandSeparator, currency } = paymentConfig;

  // XOF (Franc CFA) doesn't use decimal places
  const decimals = currency === "XOF" ? 0 : 2;

  const formatted = amount
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
