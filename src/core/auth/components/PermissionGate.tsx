import { ReactNode } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionString } from "@/types";

interface PermissionGateProps {
  permissions: PermissionString[];
  requireAll?: boolean; // true = AND (toutes requises), false = OR (au moins une)
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Composant pour afficher du contenu conditionnellement basé sur les permissions
 *
 * @example
 * ```tsx
 * <PermissionGate permissions={["CRM:CUSTOMER:WRITE"]}>
 *   <Button>Ajouter Client</Button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permissions,
  requireAll = true,
  fallback = null,
  children
}: PermissionGateProps) {
  const { hasPermissions, hasAnyPermissions } = usePermissions();

  const hasAccess = requireAll
    ? hasPermissions(permissions)
    : hasAnyPermissions(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
