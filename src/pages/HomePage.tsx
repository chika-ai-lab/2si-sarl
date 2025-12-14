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
import { useCompany } from "@/providers/ConfigProvider";
import { useTranslation } from "@/providers/I18nProvider";
import {
  getFeaturedProducts,
  getNewProducts,
  getOnSaleProducts,
  categories,
  products as allProducts,
} from "@/data/products";
import { heroSlides } from "@/constants";

export default function HomePage() {
  const company = useCompany();
  const { t } = useTranslation();
  const featuredProducts = getFeaturedProducts().slice(0, 3);
  const newProducts = getNewProducts().slice(0, 4);
  const saleProducts = getOnSaleProducts().slice(0, 4);

  return (
    <MainLayout>
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides(company)} autoplay interval={6000} />

      {/* Promo Banner */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <PromoBanner
            title="0% d'intérêt sur 6 mois"
            description="Financez vos équipements professionnels sans frais supplémentaires"
            ctaText="Voir les conditions"
            ctaLink="/catalog"
            variant="accent"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Nos Catégories
            </h2>
            <p className="text-muted-foreground">
              Trouvez l'équipement adapté à vos besoins professionnels
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
            {categories
              .filter((c) => c.id !== "all")
              .map((category, index) => (
                <div
                  key={category.id}
                  className="animate-fade-in h-full"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CategoryCard
                    id={category.id}
                    name={t(category.labelKey)}
                    productCount={
                      allProducts.filter((p) => p.category === category.id)
                        .length
                    }
                    className="w-full"
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Produits Vedettes
              </h2>
              <p className="text-muted-foreground">
                Nos équipements professionnels les plus populaires
              </p>
            </div>
            <Link to="/catalog">
              <Button variant="outline">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Products Section */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Nouveautés
                </h2>
                <p className="text-muted-foreground">
                  Découvrez nos derniers arrivages
                </p>
              </div>
              <Link to="/catalog?sort=newest">
                <Button variant="outline">
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust & Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Pourquoi choisir ProgressPay ?
            </h2>
            <p className="text-muted-foreground">
              Une solution de financement fiable et transparente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Users,
                stat: "1000+",
                label: "Clients satisfaits",
                description: "Professionnels nous font confiance",
              },
              {
                icon: CheckCircle,
                stat: "95%",
                label: "Taux d'approbation",
                description: "Réponse rapide garantie",
              },
              {
                icon: Clock,
                stat: "48h",
                label: "Délai de réponse",
                description: "Approbation ultra-rapide",
              },
              {
                icon: TrendingUp,
                stat: "0%",
                label: "Frais d'intérêt",
                description: "Sur plans 6 et 12 mois",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center items-center justify-center p-6 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {item.stat}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Trust Badges - Full */}
          <div className="mt-12">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* CTA Section - Flat Design */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-primary rounded-2xl p-12 shadow-large">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Prêt à vous équiper ?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Découvrez notre catalogue complet et trouvez les équipements
              parfaits pour développer votre activité professionnelle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/catalog">
                <Button size="xl" variant="accent" className="shadow-medium">
                  <ShoppingBag className="h-5 w-5" />
                  Explorer le catalogue
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/order">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Faire une demande
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
