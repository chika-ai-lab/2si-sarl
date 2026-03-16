// Seasonal promotions configuration
// Configure promotional banners for special occasions

export const LOCAL_STORAGE_PROMO_KEY = "2si-promotions-config";

export interface Promotion {
  id: string;
  enabled: boolean;
  title: {
    fr: string;
    en: string;
  };
  description?: {
    fr: string;
    en: string;
  };
  icon?: string; // emoji or lucide icon name
  link?: string; // Optional link to promo page
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
  backgroundColor?: string;
  textColor?: string;
}

export interface PromotionsConfig {
  enabled: boolean;
  autoRotate: boolean; // Rotate between multiple active promos
  rotationInterval: number; // in milliseconds
  promotions: Promotion[];
}

export const promotionsConfig: PromotionsConfig = {
  enabled: true,
  autoRotate: false,
  rotationInterval: 5000, // 5 seconds

  promotions: [
    {
      id: "christmas-2024",
      enabled: true,
      title: {
        fr: "🎄 Promo Noël : Jusqu'à -30% sur une sélection d'articles !",
        en: "🎄 Christmas Sale: Up to -30% off selected items!",
      },
      description: {
        fr: "Profitez de réductions exceptionnelles sur nos équipements professionnels pour célébrer les fêtes de fin d'année.",
        en: "Enjoy exceptional discounts on our professional equipment to celebrate the holiday season.",
      },
      link: "/catalog?promo=christmas",
      // Pas de dates = toujours visible (pour test)
      // Décommentez les lignes ci-dessous pour activer la période spécifique
      // startDate: "2024-12-15",
      // endDate: "2024-12-31",
      backgroundColor: "#c41e3a",
      textColor: "#ffffff",
    },
    {
      id: "newyear-2025",
      enabled: false,
      title: {
        fr: "🎊 Nouvelle Année : Profitez de nos offres spéciales !",
        en: "🎊 New Year: Take advantage of our special offers!",
      },
      description: {
        fr: "Démarrez l'année en beauté avec nos offres exclusives sur tout le catalogue.",
        en: "Start the year in style with our exclusive offers on the entire catalog.",
      },
      link: "/catalog?promo=newyear",
      startDate: "2025-01-01",
      endDate: "2025-01-15",
      backgroundColor: "#4169e1",
      textColor: "#ffffff",
    },
    {
      id: "ramadan-2025",
      enabled: false,
      title: {
        fr: "🌙 Ramadan Kareem : Offres spéciales pour le mois sacré",
        en: "🌙 Ramadan Kareem: Special offers for the holy month",
      },
      description: {
        fr: "Célébrez le mois béni avec des réductions exceptionnelles sur une sélection de produits.",
        en: "Celebrate the blessed month with exceptional discounts on selected products.",
      },
      link: "/catalog?promo=ramadan",
      startDate: "2025-03-10",
      endDate: "2025-04-09",
      backgroundColor: "#ffd700",
      textColor: "#000000",
    },
    {
      id: "independence-2025",
      enabled: false,
      title: {
        fr: "🇸🇳 Fête de l'Indépendance : Célébrons ensemble !",
        en: "🇸🇳 Independence Day: Let's celebrate together!",
      },
      description: {
        fr: "Célébrons notre fierté nationale avec des offres spéciales sur nos équipements made in Sénégal.",
        en: "Let's celebrate our national pride with special offers on our made in Senegal equipment.",
      },
      link: "/catalog?promo=independence",
      startDate: "2025-04-04",
      endDate: "2025-04-05",
      backgroundColor: "#00853f",
      textColor: "#ffffff",
    },
    {
      id: "free-delivery",
      enabled: false,
      title: {
        fr: "📦 Livraison gratuite à partir de 500 000 FCFA",
        en: "📦 Free delivery from 500,000 FCFA",
      },
      backgroundColor: "#165b33",
      textColor: "#ffffff",
    },
  ],
};

// Helper function to get active promotions
export function getActivePromotions(): Promotion[] {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  let promosToEvaluate = promotionsConfig.promotions;

  // Attempt to load from localStorage first
  try {
    const savedConfig = localStorage.getItem(LOCAL_STORAGE_PROMO_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      promosToEvaluate = parsed.promotions || promosToEvaluate;
    }
  } catch (e) {
    console.warn("Could not read dynamic promotion config from local storage", e);
  }

  return promosToEvaluate.filter((promo) => {
    if (!promo.enabled) return false;

    // If no dates specified, promo is always active
    if (!promo.startDate && !promo.endDate) return true;

    // Check if today is within the promo period
    const start = promo.startDate || "1900-01-01";
    const end = promo.endDate || "2100-12-31";

    return today >= start && today <= end;
  });
}

// Helper function to get current promo (for single display)
export function getCurrentPromotion(): Promotion | null {
  const activePromos = getActivePromotions();
  return activePromos.length > 0 ? activePromos[0] : null;
}
