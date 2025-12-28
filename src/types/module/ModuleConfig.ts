import { PermissionString } from "../entities";
import { LazyExoticComponent } from "react";

/**
 * Configuration d'un module
 */
export interface ModuleConfig {
  // Identité
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string; // Lucide icon name

  // Activation
  enabled: boolean;
  isCore: boolean; // Module core (ne peut pas être désactivé)

  // Permissions requises pour accéder au module
  requiredPermissions: PermissionString[];

  // Dépendances (autres modules requis)
  dependencies: string[];

  // Routes
  basePath: string;
  routes: ModuleRoute[];

  // Navigation
  navigation: NavigationItem[];

  // Configuration spécifique
  settings?: Record<string, any>;

  // Métadonnées
  author?: string;
  license?: string;
}

export interface ModuleRoute {
  path: string;
  component: LazyExoticComponent<any>;
  requiresPermission?: PermissionString[];
  exact?: boolean;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  requiresPermission?: PermissionString[];
  badge?: NavigationBadge;
  children?: NavigationItem[];
  order?: number; // Pour organiser l'affichage
  section?: string; // Section/groupe pour organiser la navigation
}

export interface NavigationBadge {
  value: string | number;
  variant: "default" | "primary" | "success" | "warning" | "danger";
}

export interface NavigationSection {
  id: string;
  label: string;
  order: number;
  collapsed?: boolean;
}
