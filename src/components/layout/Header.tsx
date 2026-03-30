import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Globe, Heart, Search, Mail, Phone, LogIn, UserPlus, Megaphone } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useCompany, useFeatures } from "@/providers/ConfigProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromoBanner } from "@/components/promo/PromoBanner";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const company = useCompany();
  const features = useFeatures();
  const { t, locale, setLocale, supportedLocales, localeNames } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const itemCount = getItemCount();

  // Real API category names (must match product.category from backend)
  const navCategories = [
    { name: "Informatique & Bureautique",  label: "Informatique" },
    { name: "Mobilier de Bureau",          label: "Mobilier" },
    { name: "Équipement Professionnel",    label: "Équipement" },
    { name: "Outillage Industriel",        label: "Outillage" },
    { name: "Véhicules & Engins",          label: "Véhicules" },
    { name: "Énergie & Solaire",           label: "Énergie" },
    { name: "Sécurité & Surveillance",     label: "Sécurité" },
    { name: "Électronique Grand Public",   label: "Électronique" },
  ];

  const activeCategoryParam = searchParams.get("categories");
  const activeNavLabel = activeCategoryParam
    ? (navCategories.find((c) => c.name === activeCategoryParam)?.label ?? activeCategoryParam)
    : t("common.all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const onScroll = () => {
      const current = window.scrollY || 0;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Only update if scroll difference is significant (prevents jitter at threshold)
          if (Math.abs(current - lastScrollY) > 5) {
            setIsCollapsed(current > 120);
            lastScrollY = current;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* Promo Banner - Always visible */}
      <PromoBanner />

      {/* Top Bar - Desktop Only - Hidden on scroll */}
      <div className={cn(
        "hidden lg:block bg-primary text-primary-foreground transition-all duration-500 ease-in-out overflow-hidden",
        isCollapsed ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            {/* Left: Contact Info */}
            <div className="flex items-center gap-6">
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 text-xs hover:text-primary-foreground/80 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{company.email}</span>
              </a>
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-2 text-xs hover:text-primary-foreground/80 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{company.phone}</span>
              </a>
            </div>

            {/* Center: Announcement */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <Megaphone className="h-3.5 w-3.5" />
              <span>{t("header.announcement") || "Livraison gratuite à partir de 500 000 FCFA"}</span>
            </div>

            {/* Right: Language & Auth */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs hover:text-primary-foreground/80 transition-colors">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="uppercase font-medium">{locale}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  {supportedLocales.map((loc) => (
                    <DropdownMenuItem
                      key={loc}
                      onClick={() => setLocale(loc)}
                      className={cn(
                        "cursor-pointer",
                        locale === loc && "bg-accent"
                      )}
                    >
                      <span className="font-medium">{localeNames[loc]}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-4 w-px bg-primary-foreground/30" />

              {/* Auth Links - Disabled */}
              <span
                className="flex items-center gap-1.5 text-xs text-primary-foreground/40 cursor-not-allowed select-none"
                title="Fonctionnalité bientôt disponible"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t("header.signIn")}</span>
              </span>
              <span className="text-xs text-primary-foreground/30">{t("header.or")}</span>
              <span
                className="flex items-center gap-1.5 text-xs text-primary-foreground/40 cursor-not-allowed select-none"
                title="Fonctionnalité bientôt disponible"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{t("header.register")}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-6 py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 gap-3">
              <img
                src="/logo.png"
                alt={company.name}
                className="h-12 w-auto"
              />
              <div className="hidden lg:flex flex-col">
                <span className="text-xl font-bold text-foreground leading-tight">
                  {company.legalName}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {company.tagline}
                </span>
              </div>
            </Link>

            {/* Search Bar with Category Dropdown */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-3xl">
              <div className="flex w-full border border-border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 bg-background hover:bg-muted border-r border-border transition-colors whitespace-nowrap"
                    >
                      <span className="text-sm font-medium max-w-[110px] truncate">{activeNavLabel}</span>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/catalog")}>
                      <span className="font-medium">{t("nav.allCategories")}</span>
                    </DropdownMenuItem>
                    {navCategories.map((cat) => (
                      <DropdownMenuItem
                        key={cat.name}
                        onClick={() => navigate(`/catalog?categories=${encodeURIComponent(cat.name)}`)}
                        className={cn(activeCategoryParam === cat.name && "bg-accent")}
                      >
                        {cat.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <input
                  type="text"
                  placeholder={t("header.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                />

                <button
                  type="submit"
                  className="px-6 bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium"
                >
                  {t("common.search")}
                </button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Wishlist */}
              <Link to="/wishlist" className="relative group p-2">
                <Heart className="h-6 w-6 group-hover:text-primary transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative group p-2">
                <ShoppingCart className="h-6 w-6 group-hover:text-primary transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-foreground text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-background border-t border-border/50">
        <div className="container mx-auto px-4">
          <nav className="hidden lg:flex items-center justify-center gap-1 h-11">
            <Link
              to="/catalog"
              className={cn(
                "px-4 h-full flex items-center text-sm font-medium transition-colors",
                !activeCategoryParam
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              {t("nav.deals")}
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                to={`/catalog?categories=${encodeURIComponent(cat.name)}`}
                className={cn(
                  "px-4 h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap",
                  activeCategoryParam === cat.name
                    ? "text-primary border-b-2 border-primary"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4">
            {/* Mobile Search */}
            <form
              onSubmit={handleSearch}
              className="py-4 border-b border-border"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("header.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            {/* Mobile Categories */}
            <nav className="py-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  className="px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.home")}
                </Link>
                <Link
                  to="/catalog"
                  className="px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.allCategories")}
                </Link>
                <div className="border-t border-border my-2" />
                {navCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/catalog?categories=${encodeURIComponent(cat.name)}`}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      activeCategoryParam === cat.name
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                <Link
                  to="/order"
                  className="px-4 py-3 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("order.title")}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
