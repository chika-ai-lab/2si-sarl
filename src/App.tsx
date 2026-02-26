import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import NotFoundAdminPage from "./pages/admin/NotFoundAdminPage";
import { AdminLayoutV2 } from "./components/layout/AdminLayoutV2";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { isMaintenanceModeEnabled } from "./services/settingsService";
import { useEffect, useState, Suspense } from "react";
import { getActiveModules } from "@/config/modules.config";
import { ProtectedModuleRoute } from "@/core/router/ProtectedModuleRoute";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function MainApp() {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const { user } = useAuth();

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
  if (isInMaintenance && !window.location.pathname.startsWith("/admin") && window.location.pathname !== "/login") {
    return <MaintenancePage />;
  }

  // Get active modules for the current user
  const activeModules = getActiveModules(user);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/login" element={<LoginPage />} />

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
            const moduleBase = module.basePath.replace("/admin", "").replace(/^\//, "");
            const routePath = route.path === "/"
              ? moduleBase
              : `${moduleBase}${route.path}`;

            return (
              <Route
                key={`${module.id}-${route.path}`}
                path={routePath}
                element={
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
                }
              />
            );
          })
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
                    <MainApp />
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
