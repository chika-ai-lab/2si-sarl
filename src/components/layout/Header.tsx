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
    { id: "electronics", labelKey: "catalog.categories.electronics" },
    { id: "furniture", labelKey: "catalog.categories.furniture" },
    { id: "equipment", labelKey: "catalog.categories.equipment" },
    { id: "vehicles", labelKey: "catalog.categories.vehicles" },
    { id: "tools", labelKey: "catalog.categories.tools" },
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
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
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
                      <span className="text-sm font-medium">{t("common.all")}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem>
                      <span className="font-medium">{t("nav.allCategories")}</span>
                    </DropdownMenuItem>
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.id} onClick={() => navigate(`/catalog?categories=${cat.id}`)}>
                        {t(cat.labelKey)}
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
              className="px-5 h-full flex items-center text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {t("nav.deals")}
            </Link>
            <Link
              to="/catalog?categories=electronics"
              className="px-5 h-full flex items-center text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {t("catalog.categories.electronics")}
            </Link>
            <Link
              to="/catalog?categories=furniture"
              className="px-5 h-full flex items-center text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {t("catalog.categories.furniture")}
            </Link>
            <Link
              to="/catalog?categories=equipment"
              className="px-5 h-full flex items-center text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {t("catalog.categories.equipment")}
            </Link>
            <Link
              to="/catalog?categories=tools"
              className="px-5 h-full flex items-center text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {t("catalog.categories.tools")}
            </Link>
            <Link
              to="/catalog?categories=vehicles"
              className="px-5 h-full flex items-center text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {t("catalog.categories.vehicles")}
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
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/catalog?categories=${category.id}`}
                    className="px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(category.labelKey)}
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
