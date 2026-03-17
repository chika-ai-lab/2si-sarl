import { useEffect, useState } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isCommercialFeatureEnabled } from "@/config/env.config";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { API_ENDPOINTS } from "@/modules/commercial/services/api.config";

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

export function DashboardPage() {
  const { t } = useTranslation();

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    customers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [commandesStats, clientsStats, recentRes] = await Promise.all([
          apiClient.get<any>(API_ENDPOINTS.stats.commandes),
          apiClient.get<any>(API_ENDPOINTS.stats.clients),
          apiClient.get<any>(API_ENDPOINTS.commandes.list, { per_page: 5 }),
        ]);

        setStats({
          totalOrders: commandesStats.total ?? 0,
          pendingOrders:
            (commandesStats.par_etat?.en_attente ?? 0) +
            (commandesStats.par_etat?.brouillon ?? 0),
          revenue: commandesStats.ca_total ?? 0,
          customers: clientsStats.total ?? 0,
        });

        const items: any[] = recentRes.data ?? recentRes ?? [];
        setRecentOrders(
          items.slice(0, 5).map((c: any) => ({
            id: c.reference ?? `#${c.id}`,
            customer: c.client?.nom_complet ?? c.client?.raison_sociale ?? "—",
            amount: Number(c.montant) || 0,
            status: ETAT_TO_STATUS[c.etat] ?? "pending",
            date: (c.created_at ?? "").slice(0, 10),
          }))
        );
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("admin.dashboard")}
        </h2>
        <p className="text-muted-foreground">Tableau de bord</p>
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
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.totalOrders}
            </div>
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
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pendingOrders}
            </div>
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
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(stats.revenue)}
            </div>
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
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.customers}
            </div>
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
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
