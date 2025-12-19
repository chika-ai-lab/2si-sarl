import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ConfigProvider } from "@/providers/ConfigProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderPage";
import { LoginPage } from "./pages/LoginPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { OrdersPage } from "./pages/admin/OrdersPage";
import { ProductsPage } from "./pages/admin/ProductsPage";
import { CustomersPage } from "./pages/admin/CustomersPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { isMaintenanceModeEnabled } from "./services/settingsService";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function MainApp() {
  const [isInMaintenance, setIsInMaintenance] = useState(false);

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

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes - Protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ConfigProvider>
        <I18nProvider>
          <AuthProvider>
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
          </AuthProvider>
        </I18nProvider>
      </ConfigProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
