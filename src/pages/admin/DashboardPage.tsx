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
  ScanLine,
  BookOpen,
  FileText,
  Calculator,
  Wrench,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isCommercialFeatureEnabled } from "@/config/env.config";

export function DashboardPage() {
  const { t } = useTranslation();

  // Mock data - À remplacer par de vraies données
  const stats = {
    totalOrders: 156,
    ordersChange: "+12%",
    pendingOrders: 23,
    pendingChange: "-5%",
    revenue: 245680000,
    revenueChange: "+18%",
    customers: 89,
    customersChange: "+7%",
  };

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Entreprise ABC",
      amount: 4599000,
      status: "pending" as const,
      date: "2025-01-15",
    },
    {
      id: "ORD-002",
      customer: "SARL Martin",
      amount: 1299000,
      status: "approved" as const,
      date: "2025-01-14",
    },
    {
      id: "ORD-003",
      customer: "SCI Diallo",
      amount: 8750000,
      status: "in_progress" as const,
      date: "2025-01-14",
    },
    {
      id: "ORD-004",
      customer: "Tech Solutions",
      amount: 3200000,
      status: "completed" as const,
      date: "2025-01-13",
    },
    {
      id: "ORD-005",
      customer: "Import Export Co",
      amount: 950000,
      status: "rejected" as const,
      date: "2025-01-13",
    },
  ];

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
        <p className="text-muted-foreground">
          Tableau de bord
        </p>
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
            <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">{stats.ordersChange}</span>
              <span className="text-muted-foreground">ce mois</span>
            </p>
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
            <div className="text-2xl font-bold text-foreground">{stats.pendingOrders}</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">{stats.pendingChange}</span>
              <span className="text-muted-foreground">ce mois</span>
            </p>
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
              {formatCurrency(stats.revenue)}
            </div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">{stats.revenueChange}</span>
              <span className="text-muted-foreground">ce mois</span>
            </p>
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
            <div className="text-2xl font-bold text-foreground">{stats.customers}</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">{stats.customersChange}</span>
              <span className="text-muted-foreground">ce mois</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Commandes récentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Dernières commandes en attente de traitement
              </p>
            </div>
            <Link to="/admin/orders">
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

      </div>

      {/* Accès Rapide - Module Commercial */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accès rapide</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Clients */}
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

          {/* Commandes */}
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

          {/* Scan BL */}
          {isCommercialFeatureEnabled("scanBL") && (
            <Link to="/admin/commercial/scan-bl">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                      <ScanLine className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Scan BL</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scanner les BL
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Catalogue */}
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

          {/* Accréditif */}
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

          {/* Simulation */}
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

          {/* SAV */}
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

          {/* Rapports */}
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
