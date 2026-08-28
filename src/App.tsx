import { useSSE } from "@/hooks/useSSE";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ConfigProvider } from "@/providers/ConfigProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { AuthProviderV2, useAuth } from "@/core/auth/providers/AuthProviderV2";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderPage";
import { LoginPage } from "./pages/LoginPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";
import NotFoundAdminPage from "./components/layout/NotFoundAdminPage";
import { AdminLayoutV2 } from "./components/layout/AdminLayoutV2";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { isMaintenanceModeEnabled } from "./services/settingsService";
import { useEffect, useState, Suspense } from "react";
import { getActiveModules } from "@/config/modules.config";
import { ProtectedModuleRoute } from "@/core/router/ProtectedModuleRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min — revalide si stale au montage
      gcTime: 1000 * 60 * 10, // 10 min — libère les entrées non utilisées
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true, // refetch uniquement si les données ont expiré
    },
  },
});

/**
 * Frontière d'erreur d'une route. La clé sur le pathname garantit qu'une
 * frontière en échec est remontée à neuf dès qu'on navigue ailleurs, sinon
 * l'état d'erreur resterait collé après le changement de page.
 */
function Guard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname} label={label}>
      {children}
    </ErrorBoundary>
  );
}

function MainApp() {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useSSE();

  useEffect(() => {
    const isDashboardDomain =
      window.location.hostname === "dashboard.sen-services.com";
    const isAdminPath = location.pathname.startsWith("/admin");
    const isLoginPath = location.pathname === "/login";

    if (isDashboardDomain && !isAdminPath && !isLoginPath) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // Check maintenance mode on mount and listen for storage changes
    const checkMaintenance = () => {
      setIsInMaintenance(isMaintenanceModeEnabled());
    };

    checkMaintenance();

    // Listen for storage changes (when settings are updated)
    window.addEventListener("storage", checkMaintenance);
    return () => window.removeEventListener("storage", checkMaintenance);
  }, []);

  // Show maintenance page for public routes if enabled
  if (
    isInMaintenance &&
    !window.location.pathname.startsWith("/admin") &&
    window.location.pathname !== "/login"
  ) {
    return <MaintenancePage />;
  }

  // Get active modules for the current user
  const activeModules = getActiveModules(user);

  return (
    <Routes>
      {/* Public Routes — chaque page a sa propre frontière d'erreur : un plantage
          sur l'une n'empêche pas de naviguer vers les autres. La clé sur le
          pathname réarme la frontière dès qu'on change de page. */}
      <Route
        path="/"
        element={
          <Guard label="l'accueil">
            <HomePage />
          </Guard>
        }
      />
      <Route
        path="/catalog"
        element={
          <Guard label="le catalogue">
            <CatalogPage />
          </Guard>
        }
      />
      <Route
        path="/product/:id"
        element={
          <Guard label="la fiche produit">
            <ProductDetailPage />
          </Guard>
        }
      />
      <Route
        path="/wishlist"
        element={
          <Guard label="les favoris">
            <WishlistPage />
          </Guard>
        }
      />
      <Route
        path="/cart"
        element={
          <Guard label="le panier">
            <CartPage />
          </Guard>
        }
      />
      <Route
        path="/order"
        element={
          <Guard label="la commande">
            <OrderPage />
          </Guard>
        }
      />
      <Route
        path="/login"
        element={
          <Guard label="la connexion">
            <LoginPage />
          </Guard>
        }
      />

      {/* Admin Routes - Dynamic with Modules */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayoutV2 />
          </ProtectedRoute>
        }
      >
        {/* Dynamic module routes */}
        {activeModules.flatMap((module) =>
          module.routes.map((route) => {
            // Combine basePath with route path
            // basePath: "/admin/crm", route.path: "/"  -> "crm"
            // basePath: "/admin/crm", route.path: "/customers"  -> "crm/customers"
            const moduleBase = module.basePath
              .replace("/admin", "")
              .replace(/^\//, "");
            const routePath =
              route.path === "/"
                ? moduleBase
                : [moduleBase, route.path.replace(/^\//, "")]
                    .filter(Boolean)
                    .join("/");

            return (
              <Route
                key={`${module.id}-${route.path}`}
                path={routePath}
                element={
                  // Frontière à l'intérieur du layout admin : si un module
                  // plante, le menu et les autres modules restent accessibles.
                  <Guard label="ce module">
                    <Suspense
                      fallback={
                        <div className="flex h-screen items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      }
                    >
                      <ProtectedModuleRoute
                        permissions={route.requiresPermission || []}
                        component={route.component}
                      />
                    </Suspense>
                  </Guard>
                }
              />
            );
          }),
        )}

        {/* 404 inside admin layout */}
        <Route path="*" element={<NotFoundAdminPage />} />
      </Route>

      {/* 404 for public routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ConfigProvider>
        <I18nProvider>
          <AuthProviderV2>
            <WishlistProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    {/* Filet de sécurité ultime : couvre ce qui est hors des routes */}
                    <ErrorBoundary>
                      <MainApp />
                    </ErrorBoundary>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProviderV2>
        </I18nProvider>
      </ConfigProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
