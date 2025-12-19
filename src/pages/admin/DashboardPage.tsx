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
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.stats.totalOrders")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.ordersChange}</span> ce
              mois
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.stats.pendingOrders")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stats.pendingChange}</span> ce
              mois
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.stats.revenue")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.revenueChange}</span> ce
              mois
            </p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.stats.customers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.customersChange}</span> ce
              mois
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/products">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Package className="mr-2 h-5 w-5" />
                Produits
                <span className="ml-auto text-xs text-muted-foreground">
                  Gérer le catalogue
                </span>
              </Button>
            </Link>

            <Link to="/admin/customers">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Clients
                <span className="ml-auto text-xs text-muted-foreground">
                  Voir les clients
                </span>
              </Button>
            </Link>

            <Link to="/admin/reports">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Rapports
                <span className="ml-auto text-xs text-muted-foreground">
                  Statistiques détaillées
                </span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
