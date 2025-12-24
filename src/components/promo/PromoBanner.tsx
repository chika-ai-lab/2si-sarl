import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useI18n } from "@/providers/I18nProvider";
import { getCurrentPromotion, getActivePromotions, promotionsConfig } from "@/config/promotions.config";
import type { Promotion } from "@/config/promotions.config";

export function PromoBanner() {
  const { locale } = useI18n();
  const [currentPromo, setCurrentPromo] = useState<Promotion | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!promotionsConfig.enabled) {
      setCurrentPromo(null);
      return;
    }

    const activePromos = getActivePromotions();

    if (activePromos.length === 0) {
      setCurrentPromo(null);
      return;
    }

    // If auto-rotate is enabled and there are multiple promos
    if (promotionsConfig.autoRotate && activePromos.length > 1) {
      setCurrentPromo(activePromos[0]);

      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % activePromos.length;
          setCurrentPromo(activePromos[nextIndex]);
          return nextIndex;
        });
      }, promotionsConfig.rotationInterval);

      return () => clearInterval(interval);
    } else {
      // Just show the first active promo
      setCurrentPromo(activePromos[0]);
    }
  }, []);

  // Don't show if disabled or no promo
  if (!promotionsConfig.enabled || !currentPromo || !isVisible) {
    return null;
  }

  const title = currentPromo.title[locale] || currentPromo.title.fr;
  const bgColor = currentPromo.backgroundColor || "#c41e3a";
  const textColor = currentPromo.textColor || "#ffffff";

  const content = (
    <div
      className="relative text-center py-2 px-4 text-sm font-medium transition-colors"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <span>{title}</span>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
        style={{ color: textColor }}
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  // If there's a link, wrap in Link component
  if (currentPromo.link) {
    return (
      <Link to={currentPromo.link} className="block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
