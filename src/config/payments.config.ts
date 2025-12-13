// Payment plans configuration
// Define available installment options

export interface PaymentPlan {
  id: string;
  months: number;
  labelKey: string;
  descriptionKey: string;
  interestRate: number; // Annual percentage rate
  minAmount: number;
  maxAmount: number;
  isPopular?: boolean;
}

export interface PaymentConfig {
  currency: string;
  currencySymbol: string;
  currencyPosition: "before" | "after";
  decimalSeparator: string;
  thousandSeparator: string;
  plans: PaymentPlan[];
  defaultPlanId: string;
  minOrderAmount: number;
  maxOrderAmount: number;
}

export const paymentConfig: PaymentConfig = {
  currency: "EUR",
  currencySymbol: "€",
  currencyPosition: "after",
  decimalSeparator: ",",
  thousandSeparator: " ",
  plans: [
    {
      id: "plan-6",
      months: 6,
      labelKey: "payment.plans.6months",
      descriptionKey: "payment.plans.6months.description",
      interestRate: 0,
      minAmount: 100,
      maxAmount: 10000,
    },
    {
      id: "plan-12",
      months: 12,
      labelKey: "payment.plans.12months",
      descriptionKey: "payment.plans.12months.description",
      interestRate: 2.5,
      minAmount: 200,
      maxAmount: 25000,
      isPopular: true,
    },
    {
      id: "plan-24",
      months: 24,
      labelKey: "payment.plans.24months",
      descriptionKey: "payment.plans.24months.description",
      interestRate: 4.5,
      minAmount: 500,
      maxAmount: 50000,
    },
    {
      id: "plan-36",
      months: 36,
      labelKey: "payment.plans.36months",
      descriptionKey: "payment.plans.36months.description",
      interestRate: 5.5,
      minAmount: 1000,
      maxAmount: 100000,
    },
  ],
  defaultPlanId: "plan-12",
  minOrderAmount: 100,
  maxOrderAmount: 100000,
};
