import { Link } from "react-router-dom";
import { ArrowRight, Star, Landmark, Wallet, Package, Gift, Sparkles, type LucideIcon } from "lucide-react";
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

const ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Landmark,
  Wallet,
  Package,
  Gift,
  Sparkles,
};

export function PromoSection() {
  const { locale } = useI18n();
  const activePromos = getActivePromotions();

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

  const bgColor = promo.backgroundColor || "#1a3a6b";
  const textColor = promo.textColor || "#ffffff";

  const IconComponent = promo.icon ? (ICON_MAP[promo.icon] ?? Gift) : Gift;

  const card = (
    <motion.div
      variants={staggerItemVariant}
      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Subtle radial pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, ${textColor} 1px, transparent 1px), radial-gradient(circle at 90% 80%, ${textColor} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative p-8 flex flex-col h-full min-h-[260px]">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 shrink-0"
          style={{ backgroundColor: `${textColor}18` }}
        >
          <IconComponent className="w-7 h-7" style={{ color: textColor }} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 leading-snug" style={{ color: textColor }}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm leading-relaxed flex-grow" style={{ color: `${textColor}cc` }}>
            {description}
          </p>
        )}

        {/* Dates badge */}
        {promo.endDate && (
          <div
            className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${textColor}18`, color: textColor }}
          >
            {locale === "fr" ? "Jusqu'au" : "Until"}{" "}
            {new Date(promo.endDate).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
              day: "numeric",
              month: "short",
            })}
          </div>
        )}

        {/* CTA */}
        {promo.link && (
          <div className="mt-6 flex items-center gap-2 font-semibold text-sm group-hover:gap-3 transition-all" style={{ color: textColor }}>
            <span>{locale === "fr" ? "Découvrir" : "Discover"}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Shine on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </motion.div>
  );

  if (promo.link) {
    return (
      <Link to={promo.link} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
