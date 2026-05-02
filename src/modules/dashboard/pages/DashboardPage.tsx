import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Calculator,
  Wrench,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isCommercialFeatureEnabled } from "@/config/env.config";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { API_ENDPOINTS } from "@/modules/commercial/services/api.config";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CommercialDashboard from "@/modules/commercial/pages/CommercialDashboard";
import LogistiqueDashboard from "@/modules/achats/pages/LogistiqueDashboard";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  customers: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: "pending" | "approved" | "in_progress" | "completed" | "rejected";
  date: string;
}

const ETAT_TO_STATUS: Record<string, RecentOrder["status"]> = {
  en_attente: "pending",
  brouillon: "pending",
  "validé": "approved",
  valide: "approved",
  en_cours: "in_progress",
  "livré": "completed",
  livre: "completed",
  "annulé": "rejected",
  annule: "rejected",
};

// ── Role detection — doit rester cohérent avec AuthProviderV2.detectRoleKey ──

function detectRole(roles: string[]): "admin" | "commercial" | "logistique" | "comptabilite" | "default" {
  const lower = roles.map((r) => r.toLowerCase().trim());
  if (lower.some((r) => r === "admin" || r === "super_admin")) return "admin";
  if (lower.some((r) => r === "logistique" || r === "logistic")) return "logistique";
  if (lower.some((r) => r === "comptabilite" || r === "comptable")) return "comptabilite";
  if (lower.some((r) => ["commercial", "vendeur", "vendeuse", "sales", "salesman"].includes(r))) return "commercial";
  return "default";
}

// ── Role switcher ─────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();
  const role = detectRole(user?.roles ?? []);

  if (role === "commercial")  return <CommercialDashboard />;
  if (role === "logistique")  return <LogistiqueDashboard />;
  return <AdminDashboard />;
}

// ── Admin / Comptabilité dashboard ────────────────────────────────────────

function AdminDashboard() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: rawStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const r = await apiClient.get<any>(API_ENDPOINTS.stats.dashboard);
      return r?.data ?? r;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: recentRaw, isLoading: recentLoading } = useQuery({
    queryKey: ["admin-dashboard-recent"],
    queryFn: async () => {
      const r = await apiClient.get<any>(API_ENDPOINTS.commandes.list, { per_page: 10, sort: "-created_at" });
      const list = r?.data ?? r;
      return Array.isArray(list) ? list : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const loading = statsLoading || recentLoading;

  const stats: DashboardStats = {
    totalOrders:   Number(rawStats?.commandes?.total    ?? rawStats?.total_commandes ?? rawStats?.total)   || 0,
    pendingOrders: Number(rawStats?.commandes?.en_attente ?? rawStats?.en_attente)     || 0,
    revenue:       Number(rawStats?.commandes?.ca_total  ?? rawStats?.ca_total        ?? rawStats?.revenue) || 0,
    customers:     Number(rawStats?.clients?.total       ?? rawStats?.total_clients   ?? rawStats?.clients) || 0,
  };

  const recentOrders: RecentOrder[] = (recentRaw ?? []).map((c: any) => ({
    id:       String(c.reference ?? c.id ?? "—"),
    customer: (c.client && typeof c.client === "object")
                ? (c.client.nom ?? c.client.name ?? "—")
                : (c.customer ?? "—"),
    amount:   Number(c.montant ?? c.amount) || 0,
    status:   ETAT_TO_STATUS[c.etat ?? c.statut ?? ""] ?? "pending",
    date:     c.created_at ?? c.date ?? "",
  }));

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    qc.invalidateQueries({ queryKey: ["admin-dashboard-recent"] });
  };

  const statusConfig = {
    pending: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    approved: {
      label: "Approuvé",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    in_progress: {
      label: "En cours",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: AlertCircle,
    },
    completed: {
      label: "Complété",
      color: "bg-primary/10 text-primary border-primary/20",
      icon: CheckCircle,
    },
    rejected: {
      label: "Rejeté",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("admin.dashboard")}
          </h2>
          <p className="text-muted-foreground">Tableau de bord</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {t("admin.stats.totalOrders")}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
            )}
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border-2 hover:border-yellow-500/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {t("admin.stats.pendingOrders")}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold text-foreground">{stats.pendingOrders}</div>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {t("admin.stats.revenue")}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.revenue)}</div>
            )}
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="border-2 hover:border-purple-500/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {t("admin.stats.customers")}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold text-foreground">{stats.customers}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Commandes récentes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Dernières commandes enregistrées
            </p>
          </div>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune commande pour l'instant
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{order.id}</p>
                          <Badge
                            variant="outline"
                            className={statusConfig[order.status].color}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customer}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(order.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accès Rapide - Module Commercial */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accès rapide</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isCommercialFeatureEnabled("clients") && (
            <Link to="/admin/commercial/clients">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Clients</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gérer les clients
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {isCommercialFeatureEnabled("commandes") && (
            <Link to="/admin/commercial/commandes">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Commandes</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Voir les commandes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {isCommercialFeatureEnabled("catalogue") && (
            <Link to="/admin/commercial/catalogue">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Catalogue</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Parcourir le catalogue
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {isCommercialFeatureEnabled("accreditif") && (
            <Link to="/admin/commercial/accreditif">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Accréditif</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Documents accréditifs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {isCommercialFeatureEnabled("simulation") && (
            <Link to="/admin/commercial/simulation">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Simulation</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tableau de simulation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {isCommercialFeatureEnabled("sav") && (
            <Link to="/admin/commercial/sav">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">S.A.V</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Service après-vente
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {isCommercialFeatureEnabled("rapports") && (
            <Link to="/admin/commercial/rapports">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Rapports</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Voir les rapports
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
