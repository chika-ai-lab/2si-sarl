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
  currency: "XOF",
  currencySymbol: "FCFA",
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
      minAmount: 50000,
      maxAmount: 5000000,
    },
    {
      id: "plan-12",
      months: 12,
      labelKey: "payment.plans.12months",
      descriptionKey: "payment.plans.12months.description",
      interestRate: 2.5,
      minAmount: 100000,
      maxAmount: 10000000,
      isPopular: true,
    },
    {
      id: "plan-24",
      months: 24,
      labelKey: "payment.plans.24months",
      descriptionKey: "payment.plans.24months.description",
      interestRate: 4.5,
      minAmount: 250000,
      maxAmount: 25000000,
    },
    {
      id: "plan-36",
      months: 36,
      labelKey: "payment.plans.36months",
      descriptionKey: "payment.plans.36months.description",
      interestRate: 5.5,
      minAmount: 500000,
      maxAmount: 50000000,
    },
  ],
  defaultPlanId: "plan-12",
  minOrderAmount: 50000,
  maxOrderAmount: 50000000,
};
