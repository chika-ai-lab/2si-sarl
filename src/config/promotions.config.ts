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
  icon?: string;
  link?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  backgroundColor?: string;
  textColor?: string;
}

export interface PromotionsConfig {
  enabled: boolean;
  autoRotate: boolean;
  rotationInterval: number;
  promotions: Promotion[];
}

export const promotionsConfig: PromotionsConfig = {
  enabled: true,
  autoRotate: false,
  rotationInterval: 5000,

  promotions: [
    {
      id: "tabaski-2026",
      enabled: true,
      icon: "Star",
      title: {
        fr: "Tabaski 2026 : Équipez-vous pour la fête",
        en: "Tabaski 2026: Equip yourself for the celebration",
      },
      description: {
        fr: "Équipez la maison pour la fête et réglez en plusieurs mensualités, sans frais cachés. Offre ouverte aux particuliers comme aux entreprises.",
        en: "Equip your home for the celebration and settle in monthly instalments, with no hidden fees. Open to individuals and businesses alike.",
      },
      link: "/catalog",
      startDate: "2026-05-20",
      endDate: "2026-06-20",
      backgroundColor: "#00853f",
      textColor: "#ffffff",
    },
    {
      id: "financement-cbao",
      enabled: true,
      icon: "Landmark",
      title: {
        fr: "Financement CBAO : jusqu'à 24 mois",
        en: "CBAO Financing: up to 24 months",
      },
      description: {
        fr: "Salarié ou entreprise, financez vos achats via la CBAO. Dossier simple, réponse rapide. Payez en 6, 12 ou 24 mensualités.",
        en: "Employee or business, finance your purchases through CBAO. Simple application, quick response. Pay over 6, 12 or 24 instalments.",
      },
      link: "/catalog",
      backgroundColor: "#1a3a6b",
      textColor: "#ffffff",
    },
    {
      id: "financement-cms",
      enabled: true,
      icon: "Wallet",
      title: {
        fr: "Financement CMS : jusqu'à 36 mois",
        en: "CMS Financing: up to 36 months",
      },
      description: {
        fr: "Le Crédit Mutuel du Sénégal étale vos achats jusqu'à 36 mensualités, avec des conditions avantageuses. Parlez-en à un chargé de clientèle.",
        en: "Crédit Mutuel du Sénégal spreads your purchases over up to 36 instalments, on advantageous terms. Talk to a client adviser.",
      },
      link: "/catalog",
      backgroundColor: "#c0392b",
      textColor: "#ffffff",
    },
    {
      id: "livraison-gratuite",
      enabled: false,
      icon: "Package",
      title: {
        fr: "Livraison gratuite à Dakar",
        en: "Free delivery in Dakar",
      },
      backgroundColor: "#165b33",
      textColor: "#ffffff",
    },
  ],
};

export function getActivePromotions(): Promotion[] {
  const today = new Date().toISOString().split("T")[0];

  let promosToEvaluate = promotionsConfig.promotions;

  try {
    const savedConfig = localStorage.getItem(LOCAL_STORAGE_PROMO_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      promosToEvaluate = parsed.promotions || promosToEvaluate;
    }
  } catch {
    // ignore
  }

  return promosToEvaluate.filter((promo) => {
    if (!promo.enabled) return false;
    if (!promo.startDate && !promo.endDate) return true;
    const start = promo.startDate || "1900-01-01";
    const end = promo.endDate || "2100-12-31";
    return today >= start && today <= end;
  });
}

export function getCurrentPromotion(): Promotion | null {
  const activePromos = getActivePromotions();
  return activePromos.length > 0 ? activePromos[0] : null;
}
