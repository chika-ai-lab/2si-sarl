import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "@/providers/I18nProvider";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { companyConfig } from "@/config/company.config";
import { getModuleNavigation } from "@/config/modules.config";
import * as Icons from "lucide-react";
import { Home, LogOut, Menu, X, User } from "lucide-react";
import { useState, useMemo } from "react";
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

  // Générer la navigation dynamiquement basée sur les modules accessibles
  const navigation = useMemo(() => {
    if (!user) return [];
    return getModuleNavigation(user);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Afficher les rôles de l'utilisateur
  const userRoleDisplay = useMemo(() => {
    if (!user) return "";
    if (user.roles.includes("super_admin")) return "Super Admin";
    if (user.roles.includes("admin")) return "Admin";
    if (user.roles.includes("manager")) return "Manager";
    if (user.roles.includes("staff")) return "Staff";
    return "Utilisateur";
  }, [user]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-secondary text-secondary-foreground transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-secondary-foreground/10 px-4">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">
                  {companyConfig.legalName}
                </span>
                <span className="text-xs text-secondary-foreground/70">
                  Admin
                </span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-secondary-foreground/10 transition-colors"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation Dynamique */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.length === 0 ? (
            <div className="text-center text-sm text-secondary-foreground/50 py-8">
              {sidebarOpen && <p>Aucun module accessible</p>}
            </div>
          ) : (
            navigation.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path));

              // Récupérer l'icône dynamiquement
              const IconComponent = (Icons as any)[item.icon] || Icons.Circle;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary-foreground/10"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <IconComponent className="h-5 w-5 shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
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
            })
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-secondary-foreground/10 p-4 space-y-1">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary-foreground/10"
            )}
            title={!sidebarOpen ? "Retour au site" : undefined}
          >
            <Home className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Retour au site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-red-500/10 text-red-600 hover:text-red-700"
            )}
            title={!sidebarOpen ? "Déconnexion" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Administration
              </h1>
              {user && (
                <p className="text-xs text-muted-foreground">
                  {userRoleDisplay} • {user.moduleAccess.filter(m => m.enabled).length} modules actifs
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
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
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
