import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ModuleConfig } from "@/types";
import { ProtectedModuleRoute } from "./ProtectedModuleRoute";
import { Loader2 } from "lucide-react";

interface ModuleRouterProps {
  module: ModuleConfig;
}

/**
 * Router pour un module spécifique
 * Gère le lazy loading et la protection des routes par permissions
 */
export function ModuleRouter({ module }: ModuleRouterProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Chargement du module {module.name}...
            </p>
          </div>
        </div>
      }
    >
      <Routes>
        {module.routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedModuleRoute
                permissions={route.requiresPermission || []}
                component={route.component}
              />
            }
          />
        ))}

        {/* Fallback - rediriger vers la première route du module */}
        <Route
          path="*"
          element={
            <Navigate
              to={module.routes[0]?.path || ""}
              replace
            />
          }
        />
      </Routes>
    </Suspense>
  );
}
