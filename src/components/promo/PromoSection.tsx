import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/I18nProvider";
import { getActivePromotions } from "@/config/promotions.config";
import type { Promotion } from "@/config/promotions.config";
import { motion } from "framer-motion";
import {
  fadeUpVariant,
  staggerContainerVariant,
  staggerItemVariant,
  viewportOptions,
} from "@/lib/animations";

export function PromoSection() {
  const { locale } = useI18n();
  const activePromos = getActivePromotions();

  // Don't render if no active promos or more than 3 (to avoid cluttering)
  if (activePromos.length === 0 || activePromos.length > 3) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          variants={fadeUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {locale === "fr" ? "Offres Spéciales" : "Special Offers"}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {locale === "fr" ? "Nos Promotions du Moment" : "Our Current Promotions"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "fr"
              ? "Profitez de nos offres exceptionnelles et économisez sur vos achats"
              : "Take advantage of our exceptional offers and save on your purchases"}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className={`grid gap-6 ${
            activePromos.length === 1
              ? "grid-cols-1 max-w-3xl mx-auto"
              : activePromos.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {activePromos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} locale={locale} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PromoCard({ promo, locale }: { promo: Promotion; locale: string }) {
  const title = promo.title[locale as "fr" | "en"] || promo.title.fr;
  const description = promo.description
    ? promo.description[locale as "fr" | "en"] || promo.description.fr
    : null;

  const bgColor = promo.backgroundColor || "#c41e3a";
  const textColor = promo.textColor || "#ffffff";

  const card = (
    <motion.div
      variants={staggerItemVariant}
      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Decorative background pattern */}
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
      <div className="relative p-8 flex flex-col h-full min-h-[280px]">
        {/* Icon/Emoji */}
        <div className="text-5xl mb-4">
          {promo.icon || title.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || "🎁"}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 leading-tight">
          {title.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim()}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm opacity-90 mb-6 flex-grow">{description}</p>
        )}

        {/* CTA Button */}
        {promo.link && (
          <div className="mt-auto">
            <div
              className="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all"
              style={{ color: textColor }}
            >
              <span>{locale === "fr" ? "Découvrir" : "Discover"}</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Dates badge if available */}
        {(promo.startDate || promo.endDate) && (
          <div
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            style={{
              backgroundColor: `${textColor}20`,
              color: textColor,
            }}
          >
            {promo.endDate &&
              `${locale === "fr" ? "Jusqu'au" : "Until"} ${new Date(
                promo.endDate
              ).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                day: "numeric",
                month: "short",
              })}`}
          </div>
        )}
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </motion.div>
  );

  // If there's a link, wrap in Link component
  if (promo.link) {
    return (
      <Link to={promo.link} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
