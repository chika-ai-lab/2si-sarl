import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTranslation } from "@/providers/I18nProvider";
import { formatCurrency } from "@/lib/currency";

export default function AdminPage() {
  const { t } = useTranslation();

  const stats = [
    {
      title: t("admin.stats.totalOrders"),
      value: "156",
      change: "+12%",
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t("admin.stats.pendingOrders"),
      value: "23",
      change: "-5%",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: t("admin.stats.revenue"),
      value: formatCurrency(245680),
      change: "+18%",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: t("admin.stats.customers"),
      value: "89",
      change: "+7%",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "Entreprise ABC", amount: 4599, status: "pending", date: "2024-01-15" },
    { id: "ORD-002", customer: "SARL Martin", amount: 1299, status: "approved", date: "2024-01-14" },
    { id: "ORD-003", customer: "Tech Solutions", amount: 8750, status: "pending", date: "2024-01-14" },
    { id: "ORD-004", customer: "Bureau Plus", amount: 2399, status: "approved", date: "2024-01-13" },
    { id: "ORD-005", customer: "Industrie Pro", amount: 24999, status: "review", date: "2024-01-13" },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-warning/10 text-warning",
      approved: "bg-success/10 text-success",
      review: "bg-primary/10 text-primary",
      rejected: "bg-destructive/10 text-destructive",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      approved: "Approuvé",
      review: "En révision",
      rejected: "Refusé",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("admin.title")}
            </h1>
            <p className="text-muted-foreground">{t("admin.dashboard")}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className={`text-xs mt-1 ${
                      stat.change.startsWith('+') ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.change} ce mois
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Commandes récentes
                </CardTitle>
                <button className="text-sm text-primary hover:underline">
                  Voir tout
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(order.amount)}
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: Package, label: t("admin.products"), desc: "Gérer le catalogue" },
                  { icon: Users, label: t("admin.customers"), desc: "Voir les clients" },
                  { icon: TrendingUp, label: "Rapports", desc: "Statistiques détaillées" },
                  { icon: Settings, label: t("admin.settings"), desc: "Configuration" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
