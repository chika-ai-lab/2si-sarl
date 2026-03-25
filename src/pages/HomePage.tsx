import {
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductCard } from "@/components/business/ProductCard";
import { TrustBadges } from "@/components/business/TrustBadges";
import { CategoryCard } from "@/components/business/CategoryCard";
import { PromoBanner } from "@/components/business/PromoBanner";
import { HeroCarousel } from "@/components/business/HeroCarousel";
import { PromoSection } from "@/components/promo/PromoSection";
import { SEO } from "@/components/SEO";
import { useCompany } from "@/providers/ConfigProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { heroSlides } from "@/constants";
import { motion } from "framer-motion";
import {
  fadeUpVariant,
  staggerContainerVariant,
  staggerItemVariant,
  slideInLeftVariant,
  viewportOptions,
} from "@/lib/animations";

export default function HomePage() {
  const company = useCompany();
  const { t } = useTranslation();
  const { products: apiProducts, categories: apiCategories } = useMarketplaceProducts();
  const featuredProducts = apiProducts.slice(0, 3);
  const newProducts = apiProducts.slice(3, 6);
  const saleProducts = apiProducts.slice(6, 9);
  const nonEmptyCategories = apiCategories.filter(
    (cat) => apiProducts.some((p) => p.category === cat.label)
  );

  return (
    <MainLayout>
      <SEO
        description="Découvrez notre catalogue d'équipements professionnels avec des options de paiement échelonné sur 6, 12, 24 ou 36 mois. Financez votre équipement facilement au Sénégal."
        keywords="équipement professionnel, paiement échelonné, crédit équipement, financement entreprise, Sénégal, Dakar, 2SI"
      />
      {/* Hero Carousel */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        viewport={viewportOptions}
      >
        <HeroCarousel slides={heroSlides(company)} autoplay interval={6000} />
      </motion.div>

      {/* Seasonal Promotions Section */}
      <PromoSection />

      {/* Promo Banner */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <PromoBanner
            title={t("home.promo.title")}
            description={t("home.promo.description")}
            ctaText={t("home.promo.cta")}
            ctaLink="/catalog"
            variant="accent"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {t("home.categories.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.categories.subtitle")}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch"
          >
            {nonEmptyCategories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={staggerItemVariant}
                  className="h-full"
                >
                  <CategoryCard
                    id={category.id}
                    name={category.label}
                    productCount={
                      apiProducts.filter((p) => p.category === category.label).length
                    }
                    className="w-full"
                  />
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t("home.featured.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("home.featured.subtitle")}
              </p>
            </div>
            <Link to="/catalog">
              <Button variant="outline">
                {t("home.featured.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={staggerItemVariant}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* New Products Section */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              variants={fadeUpVariant}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {t("home.new.title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("home.new.subtitle")}
                </p>
              </div>
              <Link to="/catalog?sort=newest">
                <Button variant="outline">
                  {t("home.featured.viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={staggerContainerVariant}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {newProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={staggerItemVariant}
                  className="h-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Trust & Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {t("home.trust.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.trust.subtitle")}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Users,
                stat: "1000+",
                labelKey: "home.trust.stats.clients",
                descKey: "home.trust.stats.clientsDesc",
              },
              {
                icon: CheckCircle,
                stat: "95%",
                labelKey: "home.trust.stats.approval",
                descKey: "home.trust.stats.approvalDesc",
              },
              {
                icon: Clock,
                stat: "48h",
                labelKey: "home.trust.stats.delay",
                descKey: "home.trust.stats.delayDesc",
              },
              {
                icon: TrendingUp,
                stat: "0%",
                labelKey: "home.trust.stats.interest",
                descKey: "home.trust.stats.interestDesc",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={staggerItemVariant}
                className="text-center items-center justify-center p-6 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {item.stat}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(item.labelKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(item.descKey)}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Badges - Full */}
          <div className="mt-12">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* CTA Section - Flat Design */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            variants={slideInLeftVariant}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="max-w-4xl mx-auto text-center bg-primary rounded-2xl p-12 shadow-large"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              {t("home.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/catalog">
                <Button size="xl" variant="accent" className="shadow-medium">
                  <ShoppingBag className="h-5 w-5" />
                  {t("home.cta.browseCatalog")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/order">
                <Button
                  size="xl"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 border-2 border-white"
                >
                  {t("home.cta.makeRequest")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
