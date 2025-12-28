import { LazyExoticComponent, ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/core/auth/hooks/usePermissions";
import { PermissionString } from "@/types";
import { ShieldAlert } from "lucide-react";

interface ProtectedModuleRouteProps {
  permissions: PermissionString[];
  component: LazyExoticComponent<ComponentType<any>>;
}

/**
 * Composant pour protéger une route de module par permissions
 * Vérifie que l'utilisateur a les permissions requises avant d'afficher le composant
 */
export function ProtectedModuleRoute({
  permissions,
  component: Component
}: ProtectedModuleRouteProps) {
  const { hasPermissions, user } = usePermissions();

  // Si pas authentifié, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si pas de permissions requises, afficher le composant
  if (permissions.length === 0) {
    return <Component />;
  }

  // Vérifier les permissions
  if (!hasPermissions(permissions)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-muted-foreground">
            Permissions requises :{" "}
            <code className="bg-muted px-2 py-1 rounded">
              {permissions.join(", ")}
            </code>
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
}
