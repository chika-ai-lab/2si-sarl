import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "@/providers/I18nProvider";
import { useAuth } from "@/providers/AuthProvider";
import { companyConfig } from "@/config/company.config";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  User,
} from "lucide-react";
import { useState } from "react";
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

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: t("admin.dashboard"),
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: t("admin.orders"),
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: t("admin.products"),
      href: "/admin/products",
      icon: Package,
    },
    {
      name: t("admin.customers"),
      href: "/admin/customers",
      icon: Users,
    },
    {
      name: "Rapports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      name: t("admin.settings"),
      href: "/admin/settings",
      icon: Settings,
    },
  ];

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

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary-foreground/10"
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
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
            <h1 className="text-xl font-semibold text-foreground">
              Administration
            </h1>
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
