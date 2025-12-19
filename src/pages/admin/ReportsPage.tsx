import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "@/components/admin/ReportPDF";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, change, icon, description }: StatCardProps) {
  const isPositive = change > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="outline"
            className={
              isPositive
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            }
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}%
          </Badge>
          <p className="text-xs text-muted-foreground">
            {description || "vs mois dernier"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const [period, setPeriod] = useState("30");

  // Données de démonstration
  const stats = {
    revenue: {
      value: 45789000,
      change: 12.5,
    },
    orders: {
      value: 156,
      change: 8.3,
    },
    products: {
      value: 89,
      change: 5.7,
    },
    customers: {
      value: 234,
      change: 15.2,
    },
  };

  const topProducts = [
    { name: "Ordinateur Portable Dell XPS 15", sales: 45, revenue: 58455000 },
    { name: "Écran Moniteur 32\" 4K", sales: 38, revenue: 22382000 },
    { name: "Clavier Mécanique RGB", sales: 32, revenue: 4160000 },
    { name: "Souris Sans Fil Pro", sales: 28, revenue: 2296000 },
    { name: "Webcam HD 1080p", sales: 24, revenue: 2088000 },
  ];

  const salesByCategory = [
    { category: "Électronique", sales: 142, percentage: 42 },
    { category: "Mobilier", sales: 89, percentage: 26 },
    { category: "Équipement de cuisine", sales: 67, percentage: 20 },
    { category: "Fournitures de bureau", sales: 40, percentage: 12 },
  ];

  const recentOrders = [
    {
      id: "CMD-2024-001",
      customer: "Entreprise ABC",
      amount: 2599000,
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: "CMD-2024-002",
      customer: "Société XYZ",
      amount: 1899000,
      status: "processing",
      date: "2024-01-14",
    },
    {
      id: "CMD-2024-003",
      customer: "Bureau DEF",
      amount: 3299000,
      status: "completed",
      date: "2024-01-13",
    },
  ];

  const handleExportPDF = async () => {
    try {
      const blob = await pdf(
        <ReportPDF
          period={period}
          stats={stats}
          topProducts={topProducts}
          salesByCategory={salesByCategory}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const periodLabel =
        period === "7"
          ? "7jours"
          : period === "30"
          ? "30jours"
          : period === "90"
          ? "90jours"
          : "annee";
      const date = new Date().toISOString().split("T")[0];
      link.download = `Rapport_2SI_${periodLabel}_${date}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Rapport généré",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      // Créer les données pour Excel
      const statsData = [
        { Métrique: "Chiffre d'affaires", Valeur: stats.revenue.value, Variation: `${stats.revenue.change}%` },
        { Métrique: "Commandes", Valeur: stats.orders.value, Variation: `${stats.orders.change}%` },
        { Métrique: "Produits vendus", Valeur: stats.products.value, Variation: `${stats.products.change}%` },
        { Métrique: "Clients", Valeur: stats.customers.value, Variation: `${stats.customers.change}%` },
      ];

      const productsData = topProducts.map((p) => ({
        Produit: p.name,
        Ventes: p.sales,
        "Chiffre d'affaires": p.revenue,
      }));

      const categoriesData = salesByCategory.map((c) => ({
        Catégorie: c.category,
        Ventes: c.sales,
        Pourcentage: `${c.percentage}%`,
      }));

      // Créer le workbook
      const wb = XLSX.utils.book_new();

      // Ajouter les feuilles
      const ws1 = XLSX.utils.json_to_sheet(statsData);
      const ws2 = XLSX.utils.json_to_sheet(productsData);
      const ws3 = XLSX.utils.json_to_sheet(categoriesData);

      XLSX.utils.book_append_sheet(wb, ws1, "Statistiques");
      XLSX.utils.book_append_sheet(wb, ws2, "Top Produits");
      XLSX.utils.book_append_sheet(wb, ws3, "Catégories");

      // Télécharger
      const periodLabel =
        period === "7"
          ? "7jours"
          : period === "30"
          ? "30jours"
          : period === "90"
          ? "90jours"
          : "annee";
      const date = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `Rapport_2SI_${periodLabel}_${date}.xlsx`);

      toast({
        title: "Rapport généré",
        description: "Le rapport Excel a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport Excel.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rapports</h2>
          <p className="text-muted-foreground">
            Statistiques et analyses des ventes
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="365">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Chiffre d'affaires"
          value={formatCurrency(stats.revenue.value)}
          change={stats.revenue.change}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Commandes"
          value={stats.orders.value.toString()}
          change={stats.orders.change}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="Produits vendus"
          value={stats.products.value.toString()}
          change={stats.products.change}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Clients"
          value={stats.customers.value.toString()}
          change={stats.customers.change}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Produits les plus vendus
            </CardTitle>
            <CardDescription>
              Top 5 des produits sur les {period} derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} ventes
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(product.sales / topProducts[0].sales) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Ventes par catégorie
            </CardTitle>
            <CardDescription>
              Répartition des ventes par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByCategory.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{category.category}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {category.sales} ventes
                      </p>
                      <Badge variant="outline">{category.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Commandes récentes
          </CardTitle>
          <CardDescription>
            Dernières commandes enregistrées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-sm font-semibold">
                      {order.id}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {order.status === "completed" ? "Terminée" : "En cours"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.customer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(order.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance mensuelle</CardTitle>
          <CardDescription>
            Évolution du chiffre d'affaires sur les 6 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: "Janvier 2024", revenue: 45789000, orders: 156 },
              { month: "Décembre 2023", revenue: 40654000, orders: 142 },
              { month: "Novembre 2023", revenue: 38920000, orders: 138 },
              { month: "Octobre 2023", revenue: 42100000, orders: 145 },
              { month: "Septembre 2023", revenue: 39500000, orders: 134 },
              { month: "Août 2023", revenue: 35200000, orders: 128 },
            ].map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{data.month}</p>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                      {data.orders} commandes
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(data.revenue)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all"
                    style={{
                      width: `${(data.revenue / 45789000) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
