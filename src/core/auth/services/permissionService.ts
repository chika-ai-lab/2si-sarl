import { User, PermissionString, ALL_PERMISSIONS } from "@/types";

/**
 * Vérifie si l'utilisateur possède une permission spécifique
 */
export function hasPermission(
  user: User,
  permission: PermissionString
): boolean {
  // Les rôles staff (admin, commercial, vendeur, comptable) ont des permissions par défaut (comparaison insensible à la casse)
  const rolesLower = user.roles.map((r) => r.toLowerCase().trim());
  const isStaff = rolesLower.some(r => ["admin", "super_admin", "commercial", "vendeur", "vendeuse", "sales", "comptable", "comptabilite", "logistique", "logistic"].includes(r));
  
  if (rolesLower.includes("admin") || rolesLower.includes("super_admin")) {
    return true;
  }

  // Vérifier si l'utilisateur a le wildcard
  if (user.customPermissions.includes(ALL_PERMISSIONS as PermissionString)) {
    return true;
  }

  // Vérifier les permissions custom de l'utilisateur
  if (user.customPermissions.includes(permission)) {
    return true;
  }

  // Vérifier les wildcards partiels
  // Ex: "CRM:*:*" pour toutes les permissions CRM
  const [module, resource, action] = permission.split(":");

  const wildcards = [
    `${module}:*:*`,
    `${module}:${resource}:*`,
    `${module}:*:${action}`,
    `*:${resource}:*`,
    `*:*:${action}`
  ];

  return wildcards.some((wildcard) =>
    user.customPermissions.includes(wildcard as PermissionString)
  );
}

/**
 * Vérifie si l'utilisateur possède toutes les permissions
 */
export function hasAllPermissions(
  user: User,
  permissions: PermissionString[]
): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Vérifie si l'utilisateur possède au moins une des permissions
 */
export function hasAnyPermission(
  user: User,
  permissions: PermissionString[]
): boolean {
  if (permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Vérifie si l'utilisateur a accès à un module
 */
export function hasModuleAccess(user: User, moduleId: string): boolean {
  // Les rôles staff ont accès à tous les modules par défaut (comparaison insensible à la casse)
  const rolesLower = user.roles.map((r) => r.toLowerCase().trim());
  const isStaff = rolesLower.some(r => ["admin", "super_admin", "commercial", "vendeur", "vendeuse", "sales", "comptable", "comptabilite", "logistique", "logistic"].includes(r));
  
  if (isStaff) {
    return true;
  }

  const moduleAccess = user.moduleAccess.find((m) => m.moduleId === moduleId);
  return moduleAccess?.enabled ?? false;
}

/**
 * Parse une permission string
 */
export function parsePermission(permission: PermissionString): {
  module: string;
  resource: string;
  action: string;
} {
  const [module, resource, action] = permission.split(":");
  return { module, resource, action };
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(user: User, role: string): boolean {
  return user.roles.includes(role);
}

/**
 * Vérifie si l'utilisateur est super admin
 */
export function isSuperAdmin(user: User): boolean {
  return user.roles.includes("super_admin");
}
