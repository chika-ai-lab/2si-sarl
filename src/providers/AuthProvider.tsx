import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const AUTH_STORAGE_KEY = "2si-auth-user";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load user from localStorage
function loadUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load user from localStorage:", error);
  }
  return null;
}

// Save user to localStorage
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const savedUser = loadUserFromStorage();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo credentials - In production, this should be an API call
    if (email === "admin@2si.sarl" && password === "admin123") {
      const user: User = {
        id: "1",
        email: "admin@2si.sarl",
        name: "Administrateur",
        role: "admin",
      };
      setUser(user);
      saveUserToStorage(user);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.name}`,
      });
    } else {
      throw new Error("Email ou mot de passe incorrect");
    }
  };

  const logout = () => {
    setUser(null);
    saveUserToStorage(null);

    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
