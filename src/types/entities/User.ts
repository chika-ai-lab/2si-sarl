import { PermissionString } from "./Permission";

/**
 * Modèle utilisateur V2 avec support des rôles et permissions
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;

  // Rôles et permissions V2
  roles: string[]; // IDs des rôles assignés
  customPermissions: PermissionString[]; // Permissions additionnelles

  // Accès aux modules
  moduleAccess: UserModuleAccess[];

  // Métadonnées
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;

  // Version du schéma de permissions — permet de détecter les sessions obsolètes
  permissionsVersion?: number;
}

export interface UserModuleAccess {
  moduleId: string;
  enabled: boolean;
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

/**
 * Ancien format V1 pour compatibilité
 */
export interface UserV1 {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}
