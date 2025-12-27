import { useAuth } from "../providers/AuthProviderV2";
import { PermissionString } from "@/types";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasModuleAccess,
  hasRole,
  isSuperAdmin
} from "../services/permissionService";

/**
 * Hook pour gérer les permissions de l'utilisateur
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    /**
     * Vérifie si l'utilisateur a une permission spécifique
     */
    hasPermission: (permission: PermissionString) => {
      if (!user) return false;
      return hasPermission(user, permission);
    },

    /**
     * Vérifie si l'utilisateur a toutes les permissions
     */
    hasPermissions: (permissions: PermissionString[]) => {
      if (!user) return false;
      return hasAllPermissions(user, permissions);
    },

    /**
     * Vérifie si l'utilisateur a au moins une permission
     */
    hasAnyPermissions: (permissions: PermissionString[]) => {
      if (!user) return false;
      return hasAnyPermission(user, permissions);
    },

    /**
     * Vérifie si l'utilisateur a accès à un module
     */
    hasModuleAccess: (moduleId: string) => {
      if (!user) return false;
      return hasModuleAccess(user, moduleId);
    },

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    hasRole: (role: string) => {
      if (!user) return false;
      return hasRole(user, role);
    },

    /**
     * Vérifie si l'utilisateur est super admin
     */
    isSuperAdmin: () => {
      if (!user) return false;
      return isSuperAdmin(user);
    },

    /**
     * Retourne l'utilisateur courant
     */
    user
  };
}
