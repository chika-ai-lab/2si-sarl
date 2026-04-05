import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "@/providers/I18nProvider";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { companyConfig } from "@/config/company.config";
import { getModuleNavigation } from "@/config/modules.config";
import * as Icons from "lucide-react";
import { Home, LogOut, Menu, X, User, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";
import { WelcomeOnboarding, reopenOnboarding } from "@/components/onboarding/WelcomeOnboarding";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function AdminLayoutV2() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Générer la navigation dynamiquement basée sur les modules accessibles
  const navigation = useMemo(() => {
    if (!user) return [];
    return getModuleNavigation(user);
  }, [user]);

  // Organiser la navigation par sections
  const navigationBySection = useMemo(() => {
    const SECTION_META: Record<string, { label: string; order: number }> = {
      general:      { label: "Général",       order: 1 },
      commercial:   { label: "Commercial",    order: 2 },
      logistique:   { label: "Logistique",    order: 3 },
      comptabilite: { label: "Comptabilité",  order: 4 },
      produits:     { label: "Produits & Stock", order: 5 },
      admin:        { label: "Administration",order: 6 },
    };

    const sections: Record<string, { label: string; items: typeof navigation; order: number }> = {};

    navigation.forEach((item) => {
      const key = item.section || "general";
      const meta = SECTION_META[key] ?? { label: key, order: 99 };
      if (!sections[key]) sections[key] = { label: meta.label, items: [], order: meta.order };
      sections[key].items.push(item);
    });

    return Object.entries(sections)
      .filter(([_, s]) => s.items.length > 0)
      .sort(([_, a], [__, b]) => a.order - b.order);
  }, [navigation]);

  // Afficher les titres de section uniquement pour l'admin (plusieurs sections)
  const showSectionHeaders = useMemo(() => {
    const nonGeneral = navigationBySection.filter(([k]) => k !== "general");
    return nonGeneral.length > 1;
  }, [navigationBySection]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSection = (sectionKey: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionKey)) {
      newCollapsed.delete(sectionKey);
    } else {
      newCollapsed.add(sectionKey);
    }
    setCollapsedSections(newCollapsed);
  };

  // Afficher les rôles de l'utilisateur
  const userRoleDisplay = useMemo(() => {
    if (!user) return "";
    const rolesLower = user.roles.map((r) => r.toLowerCase());
    if (rolesLower.some(r => ["admin", "super_admin"].includes(r)))                              return "Admin";
    if (rolesLower.some(r => ["commercial", "vendeur", "vendeuse", "sales"].includes(r)))        return "Commercial";
    if (rolesLower.some(r => ["logistique", "logistic"].includes(r)))                            return "Logistique";
    if (rolesLower.some(r => ["comptabilite", "comptable"].includes(r)))                         return "Comptabilité";
    return "Utilisateur";
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-secondary via-secondary to-secondary/95 text-secondary-foreground border-r border-border/50 shadow-2xl transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          // Mobile responsiveness
          "max-lg:w-64",
          sidebarOpen ? "translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-secondary-foreground/10 px-4 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {companyConfig.legalName}
                </span>
                <span className="text-xs text-secondary-foreground/70">
                  {userRoleDisplay}
                </span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all hover:shadow-md active:scale-95 lg:hover:bg-secondary-foreground/10"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-primary" />
            )}
          </button>
        </div>

        {/* Navigation Dynamique */}
        <nav className="flex-1 space-y-6 p-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-secondary-foreground/20 hover:scrollbar-thumb-secondary-foreground/30">
          {navigation.length === 0 ? (
            <div className="text-center text-sm text-secondary-foreground/50 py-8">
              {sidebarOpen && <p>Aucun module accessible</p>}
            </div>
          ) : (
            navigationBySection.map(([sectionKey, section]) => {
              const isCollapsed = collapsedSections.has(sectionKey);

              return (
                <div key={sectionKey} className="space-y-1">
                  {/* Section Header — visible uniquement pour admin (plusieurs sections) */}
                  {sidebarOpen && showSectionHeaders && sectionKey !== "general" && (
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-lg transition-all group"
                    >
                      <h3 className="text-xs font-semibold text-secondary-foreground/90 group-hover:text-primary uppercase tracking-wider">
                        {section.label}
                      </h3>
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-secondary-foreground/60 group-hover:text-primary transition-colors" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-secondary-foreground/60 group-hover:text-primary transition-colors" />
                      )}
                    </button>
                  )}

                  {/* Section Items */}
                  {!isCollapsed && section.items.map((item) => {
                    const exactOrDescendant =
                      location.pathname === item.path ||
                      location.pathname.startsWith(item.path + "/");
                    // A more specific sibling (e.g. /admin/orders/quotes) takes priority
                    // over a parent (e.g. /admin/orders) — only the deepest match is active
                    const hasMoreSpecificSibling = section.items.some(
                      (other) =>
                        other.path !== item.path &&
                        other.path.startsWith(item.path + "/") &&
                        (location.pathname === other.path ||
                          location.pathname.startsWith(other.path + "/"))
                    );
                    const isActive =
                      item.path === "/admin"
                        ? location.pathname === item.path
                        : exactOrDescendant && !hasMoreSpecificSibling;

                    // Récupérer l'icône dynamiquement
                    const IconComponent = (Icons as any)[item.icon] || Icons.Circle;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          // Fermer le drawer sur mobile après navigation
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:!text-white transition-all relative group/item",
                          isActive
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground  shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                            : "text-secondary-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-foreground hover:shadow-sm"
                        )}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
                        )}
                        <IconComponent className={cn(
                          "h-5 w-5 shrink-0 transition-transform group-hover/item:scale-110",
                          isActive && "drop-shadow-sm"
                        )} />
                        {sidebarOpen && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-medium shadow-sm",
                                  item.badge.variant === "primary" && "bg-primary text-primary-foreground",
                                  item.badge.variant === "success" && "bg-green-500 text-white",
                                  item.badge.variant === "warning" && "bg-yellow-500 text-white",
                                  item.badge.variant === "danger" && "bg-red-500 text-white",
                                  item.badge.variant === "default" && "bg-secondary-foreground/20"
                                )}
                              >
                                {item.badge.value}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-secondary-foreground/10 p-4 space-y-1 bg-gradient-to-b from-transparent to-secondary/50">
          <Link
            to="/"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/10 text-secondary-foreground hover:text-blue-600 hover:shadow-sm group"
            )}
            title={!sidebarOpen ? "Retour au site" : undefined}
          >
            <Home className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span>Retour au site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 text-red-600 hover:text-red-700 hover:shadow-sm group"
            )}
            title={!sidebarOpen ? "Déconnexion" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          "lg:pl-64",
          !sidebarOpen && "lg:pl-20"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-primary" />
          </button>

          <div className="flex flex-1 items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                {companyConfig.legalName}
              </h1>
              {user && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  <span className="font-medium text-primary">{userRoleDisplay}</span> • {user.moduleAccess.filter(m => m.enabled).length} modules actifs
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10">
                    <User className="h-4 w-4 text-primary" />
                    <span className="hidden md:inline max-w-[120px] truncate">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-primary font-medium mt-1">
                        {userRoleDisplay}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={reopenOnboarding} className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Guide d'utilisation
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      Retour au site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Onboarding — s'affiche automatiquement à la première connexion */}
      <WelcomeOnboarding />
    </div>
  );
}
