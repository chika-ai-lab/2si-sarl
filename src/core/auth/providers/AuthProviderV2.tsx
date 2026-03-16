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
      : [],
    moduleAccess: isAdmin
      ? [
        { moduleId: "dashboard", enabled: true },
        { moduleId: "crm", enabled: true },
        { moduleId: "orders", enabled: true },
        { moduleId: "products", enabled: true },
        { moduleId: "reports", enabled: true },
        { moduleId: "commercial", enabled: true }
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
      if (!user.moduleAccess || user.moduleAccess.length === 0) {
        // Si admin ou super_admin, donner accès à tous les modules
        if (user.roles?.includes("super_admin") || user.roles?.includes("admin")) {
          user.moduleAccess = [
            { moduleId: "dashboard", enabled: true },
            { moduleId: "crm", enabled: true },
            { moduleId: "orders", enabled: true },
            { moduleId: "products", enabled: true },
            { moduleId: "reports", enabled: true },
            { moduleId: "commercial", enabled: true }
          ];

          // Sauvegarder la mise à jour
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        }
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
      const roleTitle: string = backendUser.roles?.[0]?.title || 'commercial';
      const isAdmin = roleTitle.toLowerCase() === 'admin' || roleTitle.toLowerCase() === 'super_admin';

      const user: User = {
        id: String(backendUser.id),
        email: backendUser.email,
        name: backendUser.name,
        roles: [roleTitle],
        customPermissions: isAdmin
          ? ["*:*:*"]
          : [
            "COMMERCIAL:*:*",
            "DASHBOARD:*:READ",
          ],
        moduleAccess: [
          { moduleId: "dashboard", enabled: true },
          { moduleId: "crm", enabled: isAdmin },
          { moduleId: "orders", enabled: true },
          { moduleId: "products", enabled: true },
          { moduleId: "reports", enabled: true },
          { moduleId: "commercial", enabled: true },
        ],
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

  const logout = () => {
    setUser(null);
    saveUserToStorage(null);
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");

    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès"
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  };

  const isAdmin = (): boolean => {
    // Allow admin, super_admin, and all department roles to access admin area
    return user?.roles.some(role =>
      ["admin", "super_admin", "comptabilite", "commercial"].includes(role.toLowerCase())
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
