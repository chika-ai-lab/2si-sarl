import { ArrowRight, ChevronDown, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductCard } from "@/components/business/ProductCard";
import { useCompany } from "@/providers/ConfigProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { getFeaturedProducts, categories } from "@/data/products";
import { paymentConfig } from "@/config/payments.config";

export default function HomePage() {
  const company = useCompany();
  const { t } = useTranslation();
  const featuredProducts = getFeaturedProducts();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/90 text-sm animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>{t("payment.noInterest")} sur 6 mois</span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight animate-fade-in animation-delay-100">
              {company.tagline}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              {company.description}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in animation-delay-300">
              <Link to="/catalog">
                <Button size="xl" variant="accent">
                  <ShoppingBag className="h-5 w-5" />
                  {t("catalog.title")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button size="xl" variant="hero-outline">
                  {t("nav.about")}
                </Button>
              </Link>
            </div>

            {/* Payment Plans Preview */}
            <div className="pt-8 animate-fade-in animation-delay-400">
              <div className="flex flex-wrap items-center justify-center gap-4 text-primary-foreground/70 text-sm">
                <span>Paiement en :</span>
                {paymentConfig.plans.map((plan, index) => (
                  <span key={plan.id} className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-medium">
                      {plan.months} mois
                    </span>
                    {index < paymentConfig.plans.length - 1 && <span>•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
            <ChevronDown className="h-8 w-8 text-primary-foreground/50" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Nos Catégories
            </h2>
            <p className="text-muted-foreground">
              Trouvez l'équipement adapté à vos besoins
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.filter(c => c.id !== 'all').map((category, index) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.id}`}
                className="group p-6 bg-card rounded-xl border border-border/50 text-center hover:border-primary/50 hover:shadow-medium transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg gradient-primary/10 bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">
                    {category.id === 'electronics' && '💻'}
                    {category.id === 'furniture' && '🪑'}
                    {category.id === 'equipment' && '⚙️'}
                    {category.id === 'vehicles' && '🚗'}
                    {category.id === 'tools' && '🔧'}
                  </span>
                </div>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {t(category.labelKey)}
                </span>
              </Link>
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
                Nos équipements les plus demandés
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

      {/* How It Works Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Comment ça fonctionne ?
            </h2>
            <p className="text-muted-foreground">
              Un processus simple en 3 étapes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Choisissez",
                description: "Parcourez notre catalogue et sélectionnez les équipements dont vous avez besoin",
              },
              {
                step: "2",
                title: "Configurez",
                description: "Choisissez votre plan de paiement parmi nos options flexibles",
              },
              {
                step: "3",
                title: "Demandez",
                description: "Soumettez votre demande et recevez une réponse sous 48h",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center gradient-primary rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 75% 75%, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Prêt à vous équiper ?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Découvrez notre catalogue complet et trouvez les équipements parfaits pour votre activité.
              </p>
              <Link to="/catalog">
                <Button size="xl" variant="accent">
                  <ShoppingBag className="h-5 w-5" />
                  Explorer le catalogue
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
