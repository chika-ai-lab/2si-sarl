import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserV1, UserStatus } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const AUTH_STORAGE_KEY = "2si-auth-user";
const API_URL = import.meta.env.VITE_API_URL || "https://api.sen-services.com/api/v2";

// ─── Bump this whenever ROLE_CONFIG changes ───────────────────────────────────
// Stored sessions with a lower version are automatically rebuilt on load.
const PERMISSIONS_VERSION = 9; // v9: union des droits de tous les rôles d'une personne (avant : un seul rôle retenu)

// ─── Liste exhaustive des modules de l'application ───────────────────────────
const ALL_MODULE_IDS = [
  "dashboard", "commercial", "achats", "products", "orders", "reports", "admin", "crm",
] as const;

type ModuleId = typeof ALL_MODULE_IDS[number];
type RoleKey = "admin" | "responsable_commercial" | "commercial" | "logistique" | "comptabilite" | "default";

// ─── Source unique de vérité : permissions et accès modules par rôle ─────────
const ROLE_CONFIG: Record<RoleKey, { permissions: string[]; modules: ModuleId[] }> = {
  admin: {
    permissions: ["*:*:*"],
    modules: [...ALL_MODULE_IDS],
  },
  // Responsable commercial : gestion complète commandes + BDC pour logistique
  responsable_commercial: {
    permissions: [
      "DASHBOARD:*:READ",
      "COMMERCIAL:*:*",           // ventes, clients, catalogue, accréditif, SAV, rapports
      "PRODUCTS:PRODUCT:READ",
      "ACHATS:BON_COMMANDES:*",   // création et gestion des bons de commande
      "ACHATS:FOURNISSEURS:READ", // lecture fournisseurs (assignation sur BDC)
    ],
    modules: ["dashboard", "commercial", "products", "achats"],
  },
  // Commercial terrain : accès PWA uniquement, pas de /admin dans 2si-sarl
  commercial: {
    permissions: [
      "DASHBOARD:*:READ",
      "COMMERCIAL:*:*",
      "PRODUCTS:PRODUCT:READ",
    ],
    modules: [],
  },
  logistique: {
    permissions: [
      "DASHBOARD:*:READ",
      "COMMERCIAL:CATALOG:READ",
      "COMMERCIAL:CLIENTS:READ",
      "COMMERCIAL:SAV:READ",
      "COMMERCIAL:ORDERS:READ", // lecture des commandes clients (préparation des livraisons)
      "ACHATS:*:*",           // livraisons, fournisseurs, commandes fournisseurs
    ],
    modules: ["dashboard", "commercial", "achats"],
  },
  comptabilite: {
    permissions: [
      "DASHBOARD:*:READ",
      "ORDERS:ORDER:READ",
      "COMMERCIAL:ORDERS:READ",
      "REPORTS:*:*",
      "ACHATS:*:*",
      "COMMERCIAL:CLIENTS:READ",
    ],
    modules: ["dashboard", "orders", "reports", "achats", "commercial"],
  },
  default: {
    permissions: ["DASHBOARD:*:READ"],
    modules: ["dashboard"],
  },
};

// ─── Normalise une chaîne : minuscules + suppression des accents ──────────────
function norm(s: string) {
  return s.toLowerCase().trim().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// ─── Détection des rôles depuis un tableau de titres backend ─────────────────
// Une personne peut cumuler plusieurs rôles (ex. Commercial + Logistique +
// Comptabilité) : elle reçoit l'union de leurs droits. Ne retenir qu'un rôle
// lui retirait les autres — une commerciale qui fait aussi la logistique ne
// pouvait plus créer de commande.
function detectRoleKeys(roleTitles: string[]): RoleKey[] {
  const normalizedRoles = roleTitles.map((role) => norm(role));
  const hasRole = (values: string[]) => normalizedRoles.some((role) => values.includes(role));

  const keys: RoleKey[] = [];
  if (hasRole(["admin", "super_admin"])) keys.push("admin");
  if (hasRole(["responsable commercial", "responsable_commercial"])) keys.push("responsable_commercial");
  if (hasRole(["logistique", "logistic"])) keys.push("logistique");
  if (hasRole(["comptabilite", "comptable"])) keys.push("comptabilite");
  if (hasRole(["commercial", "commerciale", "vendeur", "vendeuse", "sales"])) keys.push("commercial");
  return keys.length ? keys : ["default"];
}

// ─── Construction de l'objet User à partir des rôles ─────────────────────────
// Utilisé à la fois au login et lors de la migration de sessions obsolètes.
function buildUserObject(
  id: string,
  name: string,
  email: string,
  roles: string[],
  extra: Partial<User> = {},
): User {
  const configs     = detectRoleKeys(roles).map((key) => ROLE_CONFIG[key]);
  const permissions = [...new Set(configs.flatMap((c) => c.permissions))];
  const modules     = new Set<string>(configs.flatMap((c) => c.modules));

  return {
    id,
    email,
    name,
    roles,
    customPermissions: permissions as never,
    moduleAccess: ALL_MODULE_IDS.map((moduleId) => ({
      moduleId,
      enabled: modules.has(moduleId),
    })),
    status:             "active" as UserStatus,
    createdAt:          new Date().toISOString(),
    updatedAt:          new Date().toISOString(),
    permissionsVersion: PERMISSIONS_VERSION,
    ...extra,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Résout avec `mustChangePassword` : vrai si le mot de passe provisoire doit être changé. */
  login: (telephone: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Adapter V1 → V2 (legacy) ─────────────────────────────────────────────
function adaptUserV1ToV2(old: UserV1): User {
  return buildUserObject(old.id, old.name, old.email, [old.role === "admin" ? "admin" : "default"]);
}

// ─── Chargement depuis localStorage ──────────────────────────────────────────
function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Format V1 (legacy)
    if (parsed.role && !parsed.roles) {
      return adaptUserV1ToV2(parsed as UserV1);
    }

    const stored = parsed as User;

    // Version obsolète → reconstruire les permissions depuis les rôles stockés
    if (!stored.permissionsVersion || stored.permissionsVersion < PERMISSIONS_VERSION) {
      if (stored.roles && Array.isArray(stored.roles) && stored.roles.length > 0) {
        const rebuilt = buildUserObject(stored.id, stored.name, stored.email, stored.roles, {
          lastLogin:  stored.lastLogin,
          createdAt:  stored.createdAt,
        });
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(rebuilt));
        return rebuilt;
      }
      // Impossible de reconstruire → forcer une reconnexion
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return stored;
  } catch {
    return null;
  }
}

function saveUserToStorage(user: User | null): void {
  try {
    if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    else       localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────

interface AuthProviderProps { children: ReactNode; }

export function AuthProviderV2({ children }: AuthProviderProps) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const queryClient             = useQueryClient();

  useEffect(() => {
    const stored = loadUserFromStorage();
    setUser(stored);
    setLoading(false);

    // Une session ouverte avant l'obligation de changement ne porte pas le
    // drapeau : /auth/me reste accessible et dit si le mot de passe est provisoire.
    const token = localStorage.getItem("auth-token");
    if (!stored || !token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          setUser(null);
          saveUserToStorage(null);
          localStorage.removeItem("auth-token");
          return;
        }
        if (!res.ok) return;
        const me = await res.json();
        const mustChangePassword = !!me.mustChangePassword;
        if (mustChangePassword !== !!stored.mustChangePassword) {
          const updated = { ...stored, mustChangePassword };
          setUser(updated);
          saveUserToStorage(updated);
        }
      })
      .catch(() => { /* hors ligne : on garde la session locale */ });
  }, []);

  const login = async (telephone: string, password: string): Promise<{ mustChangePassword: boolean }> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ telephone, password }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Téléphone ou mot de passe incorrect");
      }

      const data        = await response.json();
      const backendUser = data.user;

      localStorage.setItem("auth-token", data.access_token);

      // Extraire les titres de rôles depuis la réponse backend
      const roleTitles: string[] = (backendUser.roles ?? [])
        .map((r: any) => (typeof r === "string" ? r : (r.title || r.name || r.slug || "")))
        .filter(Boolean);

      if (roleTitles.length === 0) roleTitles.push("default");

      const user = buildUserObject(
        String(backendUser.id),
        backendUser.name,
        backendUser.email,
        roleTitles,
        {
          lastLogin: new Date().toISOString(),
          createdAt: backendUser.created_at,
          phone: backendUser.telephone ?? undefined,
          mustChangePassword: !!data.must_change_password,
        },
      );

      // Vider le cache avant de charger les données du nouvel utilisateur
      queryClient.clear();

      setUser(user);
      saveUserToStorage(user);

      if (!user.mustChangePassword) {
        toast({ title: "Connexion réussie", description: `Bienvenue, ${user.name}` });
      }
      return { mustChangePassword: !!user.mustChangePassword };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Impossible de modifier le mot de passe");

    if (user) {
      const updated = { ...user, mustChangePassword: false };
      setUser(updated);
      saveUserToStorage(updated);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* session déjà expirée côté serveur */ } finally {
      setUser(null);
      saveUserToStorage(null);
      localStorage.removeItem("auth-token");
      localStorage.removeItem("refresh-token");
      // Vider tout le cache React Query pour éviter les fuites de données entre sessions
      queryClient.clear();
      toast({ title: "Déconnexion", description: "Vous avez été déconnecté avec succès" });
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  };

  // Rôles autorisés à accéder à /admin dans 2si-sarl
  // Les commerciaux terrain sont PWA uniquement (role "commercial" non listé ici)
  const SARL_ROLES: RoleKey[] = ["admin", "responsable_commercial", "logistique", "comptabilite"];
  const isAdmin = (): boolean => {
    if (!user) return false;
    return detectRoleKeys(user.roles).some((key) => SARL_ROLES.includes(key));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, changePassword, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProviderV2");
  return ctx;
}
