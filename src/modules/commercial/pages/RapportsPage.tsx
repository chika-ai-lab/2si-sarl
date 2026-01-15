import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Download,
  Calendar,
  Building2,
  CreditCard,
  Percent,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  useRapportEvolutionCA,
  useStatistiquesGlobales,
} from "../hooks/useRapports";
import type { RapportFilters } from "../services/rapports.service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  exportRapportCompletExcel,
  exportEvolutionCAExcel,
  exportTopProduitsExcel,
  exportTopClientsExcel,
  exportRepartitionBanquesExcel,
} from "../utils/exportRapports";
import {
  exportRapportCompletPDF,
  exportEvolutionCAPDF,
  exportTopProduitsPDF,
  exportTopClientsPDF,
  exportRepartitionBanquesPDF,
} from "../utils/exportRapportsPDF";
import {
  exportRapportCompletAvecGraphiquesPDF,
  exportEvolutionCAAvecGraphiquePDF,
  exportTopProduitsAvecStylePDF,
  exportTopClientsAvecStylePDF,
  exportTousGraphiquesPDF,
} from "../utils/exportRapportsAvecGraphiques";
import { toast } from "@/hooks/use-toast";

export default function RapportsPage() {
  const [filters, setFilters] = useState<RapportFilters>({
    dateDebut: "2024-07-01",
    dateFin: "2024-12-31",
  });

  const [periodeVue, setPeriodeVue] = useState<"mensuelle" | "hebdomadaire">("mensuelle");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { data: rapportData, isLoading } = useRapportEvolutionCA(filters);
  const { data: stats } = useStatistiquesGlobales();

  const handleExportComplet = () => {
    if (!rapportData) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportRapportCompletExcel(rapportData, filters);
      toast({
        title: "Export réussi",
        description: "Le rapport complet a été exporté en Excel",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    }
  };

  const handleExportEvolutionCA = () => {
    const evolutionData = periodeVue === "mensuelle"
      ? rapportData?.evolutionMensuelle
      : rapportData?.evolutionHebdomadaire;

    if (!evolutionData) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportEvolutionCAExcel(evolutionData, periodeVue);
      toast({
        title: "Export réussi",
        description: `L'évolution ${periodeVue} a été exportée en Excel`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    }
  };

  const handleExportTopProduits = () => {
    if (!rapportData?.topProduits) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportTopProduitsExcel(rapportData.topProduits);
      toast({
        title: "Export réussi",
        description: "Le top produits a été exporté en Excel",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    }
  };

  const handleExportTopClients = () => {
    if (!rapportData?.topClients) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportTopClientsExcel(rapportData.topClients);
      toast({
        title: "Export réussi",
        description: "Le top clients a été exporté en Excel",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    }
  };

  const handleExportRepartitionBanques = () => {
    if (!rapportData?.repartitionBanques) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportRepartitionBanquesExcel(rapportData.repartitionBanques);
      toast({
        title: "Export réussi",
        description: "La répartition par banque a été exportée en Excel",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    }
  };

  // ============================================
  // FONCTIONS D'EXPORT PDF
  // ============================================

  const handleExportCompletPDF = () => {
    if (!rapportData) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportRapportCompletPDF(rapportData, filters);
      toast({
        title: "Export PDF réussi",
        description: "Le rapport complet a été exporté en PDF avec style",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportEvolutionCAPDF = () => {
    const evolutionData = periodeVue === "mensuelle"
      ? rapportData?.evolutionMensuelle
      : rapportData?.evolutionHebdomadaire;

    if (!evolutionData) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportEvolutionCAPDF(evolutionData, periodeVue);
      toast({
        title: "Export PDF réussi",
        description: `L'évolution ${periodeVue} a été exportée en PDF`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportTopProduitsPDF = () => {
    if (!rapportData?.topProduits) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportTopProduitsPDF(rapportData.topProduits);
      toast({
        title: "Export PDF réussi",
        description: "Le top produits a été exporté en PDF",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportTopClientsPDF = () => {
    if (!rapportData?.topClients) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportTopClientsPDF(rapportData.topClients);
      toast({
        title: "Export PDF réussi",
        description: "Le top clients a été exporté en PDF",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportRepartitionBanquesPDF = () => {
    if (!rapportData?.repartitionBanques) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    try {
      exportRepartitionBanquesPDF(rapportData.repartitionBanques);
      toast({
        title: "Export PDF réussi",
        description: "La répartition par banque a été exportée en PDF",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  // ============================================
  // FONCTIONS D'EXPORT PDF AVEC GRAPHIQUES
  // ============================================

  const handleExportCompletAvecGraphiques = async () => {
    if (!rapportData || !stats) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simuler la progression pendant la capture
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      await exportRapportCompletAvecGraphiquesPDF(rapportData, stats, filters);

      clearInterval(progressInterval);
      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);

      toast({
        title: "Export PDF avec graphiques réussi",
        description: "Le rapport complet avec graphiques a été exporté",
      });
    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportTousGraphiques = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 200);

      await exportTousGraphiquesPDF();

      clearInterval(progressInterval);
      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);

      toast({
        title: "Export graphiques réussi",
        description: "Tous les graphiques ont été exportés en PDF",
      });
    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Chargement des rapports...</div>
      </div>
    );
  }

  const evolutionData =
    periodeVue === "mensuelle"
      ? rapportData?.evolutionMensuelle
      : rapportData?.evolutionHebdomadaire;

  // Préparer les données pour les graphiques
  const chartData = evolutionData?.map((item) => ({
    periode: item.periode,
    montant: item.montant / 1000000, // Convertir en millions
    commandes: item.nombreCommandes,
    panier: item.montantMoyen / 1000, // Convertir en milliers
  }));

  const pieData = rapportData?.repartitionBanques.map((item) => ({
    name: item.banque,
    value: item.chiffreAffaire,
    commandes: item.nombreCommandes,
  }));

  const COLORS = ["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#0891b2"];

  return (
    <div className="space-y-6">
      {/* Export Progress Bar */}
      {isExporting && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Download className="h-5 w-5 text-primary animate-bounce" />
                  <div className="absolute inset-0 animate-ping">
                    <Download className="h-5 w-5 text-primary opacity-75" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Export PDF en cours</span>
                    <span className="text-xs text-muted-foreground">
                      Capture des graphiques et génération du document...
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">{exportProgress}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                    style={{ width: `${exportProgress}%` }}
                  >
                    {/* Effet de brillance animé */}
                    <div
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rapports Commerciaux</h2>
          <p className="text-muted-foreground">
            Analyse des performances et statistiques d'activité
          </p>
        </div>

        <div className="flex gap-2">
          {/* Export Excel */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exporter Excel
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Exports Excel</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportComplet}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Rapport Complet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportEvolutionCA}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Évolution CA
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportTopProduits}>
                <Package className="mr-2 h-4 w-4" />
                Top Produits
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportTopClients}>
                <Users className="mr-2 h-4 w-4" />
                Top Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRepartitionBanques}>
                <Building2 className="mr-2 h-4 w-4" />
                Répartition Banques
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export PDF */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Exporter PDF
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Exports PDF Stylisés</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCompletAvecGraphiques}>
                <Download className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-semibold">Rapport Complet avec Graphiques</span>
                  <span className="text-xs text-muted-foreground">KPIs + Graphiques + Tableaux</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportTousGraphiques}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Tous les Graphiques
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCompletPDF}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Rapport Tableaux Uniquement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportEvolutionCAPDF}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Évolution CA (tableau)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportTopProduitsPDF}>
                <Package className="mr-2 h-4 w-4" />
                Top Produits (tableau)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportTopClientsPDF}>
                <Users className="mr-2 h-4 w-4" />
                Top Clients (tableau)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRepartitionBanquesPDF}>
                <Building2 className="mr-2 h-4 w-4" />
                Répartition Banques (tableau)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date début
              </Label>
              <input
                type="date"
                value={filters.dateDebut}
                onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date fin
              </Label>
              <input
                type="date"
                value={filters.dateFin}
                onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Banque</Label>
              <Select
                value={filters.banque || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, banque: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les banques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les banques</SelectItem>
                  <SelectItem value="CBAO">CBAO</SelectItem>
                  <SelectItem value="CMS">CMS</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Vue période</Label>
              <Select
                value={periodeVue}
                onValueChange={(value) => setPeriodeVue(value as "mensuelle" | "hebdomadaire")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensuelle">Mensuelle</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {stats && (
        <div id="kpis-section" className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CA Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.chiffreAffaireTotal)}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Badge
                  variant="outline"
                  className={
                    stats.evolutionCA >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {stats.evolutionCA >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.evolutionCA).toFixed(1)}%
                </Badge>
                <span className="ml-2">vs mois précédent</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nombreCommandesTotal}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Badge
                  variant="outline"
                  className={
                    stats.evolutionCommandes >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {stats.evolutionCommandes >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.evolutionCommandes).toFixed(1)}%
                </Badge>
                <span className="ml-2">ce mois : {stats.nombreCommandesMois}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.panierMoyen)}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Badge
                  variant="outline"
                  className={
                    stats.evolutionPanierMoyen >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {stats.evolutionPanierMoyen >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.evolutionPanierMoyen).toFixed(1)}%
                </Badge>
                <span className="ml-2">vs mois précédent</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tauxConversion.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.nombreClientsActifs} clients actifs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Secondary KPIs */}
      {stats && (
        <div id="secondary-kpis-section" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accréditifs Actifs</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nombreAccreditifsActifs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Montant total : {formatCurrency(stats.montantAccreditifsActifs)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CA du Mois</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.chiffreAffaireMois)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.nombreCommandesMois} commandes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Évolution du CA */}
        <Card id="chart-evolution-ca" className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution du Chiffre d'Affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "montant") return [`${value.toFixed(2)} M FCFA`, "CA"];
                    if (name === "commandes") return [value, "Commandes"];
                    if (name === "panier") return [`${value.toFixed(0)} K FCFA`, "Panier moyen"];
                    return value;
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="montant"
                  stroke="#2563eb"
                  strokeWidth={3}
                  name="CA (M FCFA)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="commandes"
                  stroke="#16a34a"
                  strokeWidth={2}
                  name="Commandes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par banque */}
        <Card id="chart-repartition-banque">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Répartition par Banque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Panier moyen */}
        <Card id="chart-panier-moyen">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Évolution du Panier Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periode" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value.toFixed(0)} K FCFA`} />
                <Legend />
                <Bar dataKey="panier" fill="#ea580c" name="Panier moyen (K FCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Produits */}
        <Card id="table-top-produits">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top 5 Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">CA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rapportData?.topProduits.slice(0, 5).map((produit, index) => (
                  <TableRow key={produit.produitId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="font-medium text-sm line-clamp-1">
                          {produit.produitNom}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{produit.quantiteVendue}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(produit.chiffreAffaire)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card id="table-top-clients">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top 5 Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Cmd</TableHead>
                  <TableHead className="text-right">CA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rapportData?.topClients.slice(0, 5).map((client, index) => (
                  <TableRow key={client.clientId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="font-medium text-sm">{client.clientNom}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{client.nombreCommandes}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(client.chiffreAffaire)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Détails par Banque */}
      <Card id="table-banques">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Détails par Banque Partenaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banque</TableHead>
                <TableHead className="text-right">Chiffre d'Affaires</TableHead>
                <TableHead className="text-right">Nombre de Commandes</TableHead>
                <TableHead className="text-right">Nombre de Clients</TableHead>
                <TableHead className="text-right">CA Moyen par Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rapportData?.repartitionBanques.map((banque) => (
                <TableRow key={banque.banque}>
                  <TableCell className="font-semibold">{banque.banque}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatCurrency(banque.chiffreAffaire)}
                  </TableCell>
                  <TableCell className="text-right">{banque.nombreCommandes}</TableCell>
                  <TableCell className="text-right">{banque.nombreClients}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(banque.chiffreAffaire / banque.nombreClients)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
