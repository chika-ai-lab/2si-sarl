import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserV1, UserStatus } from "@/types";
import { toast } from "@/hooks/use-toast";

const AUTH_STORAGE_KEY = "2si-auth-user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAdmin: () => boolean; // Kept for backward compatibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Adapter pour convertir les utilisateurs V1 vers V2
 */
function adaptUserV1ToV2(oldUser: UserV1): User {
  const isAdmin = oldUser.role === "admin";

  return {
    id: oldUser.id,
    email: oldUser.email,
    name: oldUser.name,
    roles: isAdmin ? ["admin"] : ["client"],
    customPermissions: isAdmin
      ? [
        "DASHBOARD:*:*",
        "CRM:*:*",
        "ORDERS:*:*",
        "PRODUCTS:*:*",
        "REPORTS:*:READ",
        "COMMERCIAL:*:*"
      ]
      : [] as any,
    moduleAccess: isAdmin
      ? [
        { moduleId: "dashboard", enabled: true },
        { moduleId: "crm", enabled: true },
        { moduleId: "orders", enabled: true },
        { moduleId: "products", enabled: true },
        { moduleId: "reports", enabled: true },
        { moduleId: "commercial", enabled: true },
        { moduleId: "admin", enabled: true },
      ]
      : [],
    status: "active" as UserStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Charger l'utilisateur depuis localStorage
 */
function loadUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Vérifier si c'est un utilisateur V1 (ancien format)
      if (parsed.role && !parsed.roles) {
        return adaptUserV1ToV2(parsed as UserV1);
      }

      // Vérifier si l'utilisateur V2 a tous les modules (migration incomplète)
      const user = parsed as User;
      const rolesLower = user.roles?.map(r => r.toLowerCase().trim()) || [];
      const isStaff = rolesLower.some(r => ["admin", "super_admin", "commercial", "vendeur", "vendeuse", "sales", "salesman", "comptable", "comptabilite"].includes(r));

      if (!user.moduleAccess || user.moduleAccess.length === 0) {
        if (isStaff) {
          user.moduleAccess = [
            { moduleId: "dashboard", enabled: true },
            { moduleId: "crm", enabled: true },
            { moduleId: "orders", enabled: true },
            { moduleId: "products", enabled: true },
            { moduleId: "reports", enabled: true },
            { moduleId: "commercial", enabled: true },
            { moduleId: "admin", enabled: true },
          ];
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        }
      } else if (isStaff && !user.moduleAccess.find((m) => m.moduleId === "admin")) {
        // Migration : ajouter le module admin manquant pour les sessions existantes
        user.moduleAccess = [...user.moduleAccess, { moduleId: "admin", enabled: true }];
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }

      return user;
    }
  } catch (error) {
    console.error("Failed to load user from localStorage:", error);
  }
  return null;
}

/**
 * Sauvegarder l'utilisateur dans localStorage
 */
function saveUserToStorage(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to save user to localStorage:", error);
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProviderV2({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const savedUser = loadUserFromStorage();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Email ou mot de passe incorrect");
      }

      const data = await response.json();
      // data = { access_token, token_type, user: { id, name, email, roles: [{title}] } }

      localStorage.setItem('auth-token', data.access_token);

      const backendUser = data.user;
      
      // Extraire tous les titres/noms de rôles de manière plus robuste
      const roleTitles: string[] = backendUser.roles && backendUser.roles.length > 0
        ? backendUser.roles.map((r: any) => {
            if (typeof r === 'string') return r;
            return r.title || r.name || r.slug || r.displayName;
          }).filter(Boolean)
        : ['commercial'];

      // Normaliser les rôles pour la détection
      const rolesLower = roleTitles.map(r => r.toLowerCase().trim());
      
      const isAdmin      = rolesLower.some(r => r === 'admin' || r === 'super_admin');
      const isComptable  = rolesLower.some(r => r === 'comptable' || r === 'comptabilite');
      const isCommercial = rolesLower.some(r => r === 'commercial' || r === 'vendeur' || r === 'vendeuse' || r === 'sales' || r === 'salesman');

      const customPermissions: string[] = isAdmin
        ? ["*:*:*"]
        : isComptable
        ? [
            "DASHBOARD:*:READ",
            "ORDERS:ORDER:READ",
            "REPORTS:REPORT:READ",
            "REPORTS:*:*",
            "ACHATS:*:*",
            "PRODUCTS:PRODUCT:READ",
          ]
        : isCommercial
        ? [
            "DASHBOARD:*:READ",
            "COMMERCIAL:*:*",
            "CRM:CUSTOMER:READ",
            "CRM:*:*",
            "ORDERS:ORDER:READ",
            "PRODUCTS:PRODUCT:READ",
          ]
        : [
            "DASHBOARD:*:READ",
          ];

      const moduleAccess = [
        { moduleId: "dashboard",  enabled: true },
        { moduleId: "crm",        enabled: isAdmin || isCommercial },
        { moduleId: "orders",     enabled: isAdmin || isCommercial || isComptable },
        { moduleId: "products",   enabled: isAdmin || isCommercial || isComptable },
        { moduleId: "reports",    enabled: isAdmin || isComptable },
        { moduleId: "commercial", enabled: isAdmin || isCommercial },
        { moduleId: "achats",     enabled: isAdmin || isComptable },
        { moduleId: "admin",      enabled: isAdmin },
      ];

      const user: User = {
        id: String(backendUser.id),
        email: backendUser.email,
        name: backendUser.name,
        roles: roleTitles,
        customPermissions: customPermissions as any,
        moduleAccess,
        status: "active" as UserStatus,
        lastLogin: new Date().toISOString(),
        createdAt: backendUser.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(user);
      saveUserToStorage(user);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.name}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Failed to invalidate session on server:", error);
    } finally {
      setUser(null);
      saveUserToStorage(null);
      localStorage.removeItem("auth-token");
      localStorage.removeItem("refresh-token");

      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès"
      });
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  };

  const isAdmin = (): boolean => {
    // Tous les rôles métier (admin, commercial, comptable, vendeur) accèdent à l'espace /admin
    return user?.roles.some(role =>
      ["admin", "super_admin", "comptable", "comptabilite", "commercial", "vendeur", "vendeuse", "sales", "salesman"].includes(role.toLowerCase().trim())
    ) || false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProviderV2");
  }
  return context;
}
