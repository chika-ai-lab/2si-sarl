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
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
  CLIENT = "client"
}
