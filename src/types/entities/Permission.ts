/**
 * Système de permissions pour l'architecture modulaire V2
 * Format: "MODULE:RESOURCE:ACTION"
 * Exemple: "CRM:CUSTOMER:READ"
 */

export interface Permission {
  id: string;
  module: string;
  resource: string;
  action: PermissionAction;
  description: string;
}

export enum PermissionAction {
  READ = "READ",
  WRITE = "WRITE",
  DELETE = "DELETE",
  ADMIN = "ADMIN"
}

/**
 * Format string pour les permissions
 * Exemples:
 * - "CRM:CUSTOMER:READ"
 * - "ORDERS:ORDER:WRITE"
 * - "PRODUCTS:PRODUCT:DELETE"
 * - "SETTINGS:SETTINGS:ADMIN"
 */
export type PermissionString = `${string}:${string}:${PermissionAction}`;

/**
 * Wildcard pour toutes les permissions
 * "*:*:*" = Super Admin
 */
export const ALL_PERMISSIONS = "*:*:*";
