import { useSearchParams } from "react-router-dom";
import { Sparkles, Tag } from "lucide-react";
import { useI18n } from "@/providers/I18nProvider";
import { promotionsConfig } from "@/config/promotions.config";

export function PromoPageBanner() {
  const [searchParams] = useSearchParams();
  const { locale } = useI18n();
  const promoCode = searchParams.get("promo");

  if (!promoCode) return null;

  // Find the promo in config
  const promo = promotionsConfig.promotions.find((p) => p.id.includes(promoCode));

  if (!promo) return null;

  const title = promo.title[locale as "fr" | "en"] || promo.title.fr;
  const description = promo.description
    ? promo.description[locale as "fr" | "en"] || promo.description.fr
    : null;

  const bgColor = promo.backgroundColor || "#c41e3a";
  const textColor = promo.textColor || "#ffffff";

  return (
    <div
      className="mb-8 rounded-2xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="p-8 md:p-12 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${textColor} 1px, transparent 1px), radial-gradient(circle at 80% 80%, ${textColor} 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: `${textColor}20` }}
            >
              <Tag className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                {locale === "fr" ? "Promotion en cours" : "Active Promotion"}
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {title.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim()}
          </h2>

          {description && (
            <p className="text-lg opacity-90 max-w-3xl">{description}</p>
          )}

          {/* Date badge if available */}
          {promo.endDate && (
            <div className="mt-6 inline-flex items-center gap-2">
              <div
                className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
                style={{
                  backgroundColor: `${textColor}20`,
                  color: textColor,
                }}
              >
                {locale === "fr" ? "Valable jusqu'au" : "Valid until"}{" "}
                {new Date(promo.endDate).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-US",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
