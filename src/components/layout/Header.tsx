import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Globe, Heart, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useCompany, useFeatures } from "@/providers/ConfigProvider";
import { useI18n } from "@/providers/I18nProvider";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const itemCount = getItemCount();

  const categories = [
    { id: "informatique", label: "Informatique" },
    { id: "mobilier", label: "Mobilier" },
    { id: "equipement", label: "Équipement" },
    { id: "vehicule", label: "Véhicules" },
    { id: "outillage", label: "Outillage" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const current = window.scrollY || 0;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsCollapsed(current > 80);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-background border-b border-border transition-shadow duration-200",
        isCollapsed ? "shadow-sm" : "shadow-md"
      )}
    >
      {/* Top Bar */}
      <div
        className={cn(
          "bg-primary text-primary-foreground transition-[height,opacity] duration-200 overflow-hidden",
          isCollapsed ? "h-0 opacity-0" : "py-2"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <div className="flex items-center gap-4">
              <span>📞 Support: +221 XX XXX XX XX</span>
              <span className="hidden md:inline">
                ✉️ contact@progresspay.sn
              </span>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {localeNames[locale]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {supportedLocales.map((loc) => (
                    <DropdownMenuItem
                      key={loc}
                      onClick={() => setLocale(loc)}
                      className={locale === loc ? "bg-secondary" : ""}
                    >
                      {localeNames[loc]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Search Bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div
            className={cn(
              "flex items-center justify-between gap-4 transition-all duration-200",
              isCollapsed ? "h-14" : "h-20"
            )}
          >
            {/* Logo */}
            <Link
              to="/"
              className={cn(
                "flex items-center gap-3 hover:opacity-80 transition-all shrink-0",
                isCollapsed ? "-mt-1" : ""
              )}
            >
              <div
                className={cn(
                  "rounded-lg bg-primary flex items-center justify-center shadow-soft transition-all duration-200",
                  isCollapsed ? "w-10 h-10" : "w-12 h-12"
                )}
              >
                <span
                  className={cn(
                    "text-primary-foreground font-bold transition-all duration-200",
                    isCollapsed ? "text-lg" : "text-xl"
                  )}
                >
                  {company.name.charAt(0)}
                </span>
              </div>
              <div
                className={cn(
                  "hidden sm:block transition-opacity duration-200",
                  isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                <div className="font-bold text-2xl text-foreground">
                  {company.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Paiement échelonné simple
                </div>
              </div>
            </Link>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className={cn(
                "hidden md:flex flex-1 max-w-2xl mx-8 transition-all duration-200",
                isCollapsed
                  ? "md:opacity-0 md:pointer-events-none md:max-w-0"
                  : "md:opacity-100 md:max-w-2xl"
              )}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher des produits, catégories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-12 text-base"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                title="Favoris"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs font-bold flex items-center justify-center"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              {/* Cart Button */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs font-bold flex items-center justify-center"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="bg-background/95 backdrop-blur-sm transition-all duration-200">
        <div className="container mx-auto px-4">
          <nav
            className={cn(
              "hidden lg:flex items-center justify-center gap-1 transition-all",
              isCollapsed ? "py-1" : "py-3"
            )}
          >
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/catalog"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Tout le catalogue
            </Link>
            <div className="w-px h-6 bg-border mx-2" />
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?categories=${category.id}`}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </Link>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            <Link
              to="/order"
              className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg transition-colors"
            >
              Faire une demande
            </Link>
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
                  placeholder="Rechercher..."
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
                  Accueil
                </Link>
                <Link
                  to="/catalog"
                  className="px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tout le catalogue
                </Link>
                <div className="border-t border-border my-2" />
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/catalog?categories=${category.id}`}
                    className="px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                <Link
                  to="/order"
                  className="px-4 py-3 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Faire une demande
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
