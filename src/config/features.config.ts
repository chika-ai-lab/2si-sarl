// Feature flags configuration
// Enable/disable features without code changes

export interface FeaturesConfig {
  enableOnlinePayment: boolean;
  enableCustomerAccount: boolean;
  enableAdminDashboard: boolean;
  enableProductReviews: boolean;
  enableWishlist: boolean;
  enableProductComparison: boolean;
  enableChatSupport: boolean;
  enableNewsletterSignup: boolean;
  enableSocialLogin: boolean;
  enableOrderTracking: boolean;
  enableMultiCurrency: boolean;
  maintenanceMode: boolean;
}

export const featuresConfig: FeaturesConfig = {
  enableOnlinePayment: false,
  enableCustomerAccount: false,
  enableAdminDashboard: true,
  enableProductReviews: false,
  enableWishlist: false,
  enableProductComparison: false,
  enableChatSupport: false,
  enableNewsletterSignup: true,
  enableSocialLogin: false,
  enableOrderTracking: false,
  enableMultiCurrency: false,
  maintenanceMode: false,
};
