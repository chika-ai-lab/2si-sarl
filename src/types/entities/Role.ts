import { PermissionString } from "./Permission";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionString[];
  isSystemRole: boolean;
  moduleAccess: ModuleAccess[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleAccess {
  moduleId: string;
  enabled: boolean;
  permissions: PermissionString[];
}

/**
 * Rôles système prédéfinis
 */
export enum SystemRole {
  SUPER_ADMIN = "super_admin",  // Accès total à tout
  ADMIN = "admin",               // Administrateur général
  COMPTABILITE = "comptabilite", // Département Comptabilité
  COMMERCIAL = "commercial",     // Département Commercial
  CLIENT = "client"              // Client externe
}
