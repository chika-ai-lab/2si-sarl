import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package, Truck, CheckCircle2, Clock, BarChart3,
  ClipboardList, ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { CMD_STATUT, mapCmdStatut } from "@/modules/commercial/lib/commandes.constants";

async function fetchAllCommandes() {
  const res = await apiClient.get<any>("/commande-clients");
  return (res.data ?? res ?? []).map((c: any) => ({
    id:        String(c.id),
    reference: c.reference || `CMD-${String(c.id).padStart(5, "0")}`,
    statut:    mapCmdStatut(c.etat),
    date:      c.date || c.created_at?.split("T")[0] || "",
    client:    c.client ? (`${c.client.nom || ""} ${c.client.prenom || ""}`).trim() || c.client.raison_sociale : "—",
    telephone: c.client?.telephone || "",
    montant:   Number(c.montant) || 0,
    articles:  (c.articles || []).length,
  }));
}

export default function LogistiqueDashboard() {
  const { data: commandes = [], isLoading } = useQuery({
    queryKey: ["logistique-all-commandes"],
    queryFn:  fetchAllCommandes,
    staleTime: 1000 * 60 * 2,
  });

  const stats = useMemo(() => {
    const aPrep   = commandes.filter((c) => c.statut === "validee");
    const enCours = commandes.filter((c) => c.statut === "en_cours");
    const livrees = commandes.filter((c) => c.statut === "livree");
    const total   = commandes.filter((c) => c.statut !== "brouillon").length;
    const tauxLiv = total > 0 ? Math.round((livrees.length / total) * 100) : 0;

    const now = new Date();
    const moisKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const livreesMois = livrees.filter((c) => c.date?.startsWith(moisKey));

    return { aPrep, enCours, livrees, livreesMois, total, tauxLiv };
  }, [commandes]);

  const kpis = [
    {
      label: "À préparer",
      value: stats.aPrep.length,
      icon: ClipboardList,
      color: "from-blue-500 to-blue-600",
      bg:    "border-blue-200 bg-blue-50/30",
      note:  "Commandes validées",
    },
    {
      label: "En livraison",
      value: stats.enCours.length,
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      bg:    "border-orange-200 bg-orange-50/30",
      note:  "En cours de traitement",
    },
    {
      label: "Livrées ce mois",
      value: stats.livreesMois.length,
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
      bg:    "border-green-200 bg-green-50/30",
      note:  `${stats.livrees.length} au total`,
    },
    {
      label: "Taux de livraison",
      value: `${stats.tauxLiv}%`,
      icon: BarChart3,
      color: "from-primary to-accent",
      bg:    "border-primary/20 bg-primary/5",
      note:  `sur ${stats.total} commandes`,
    },
  ];

  const filePriorite = [...stats.aPrep, ...stats.enCours].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Logistique
        </h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble des livraisons et traitements</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className={`border-2 ${k.bg} transition-all hover:shadow-md`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${k.color} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-8 w-16" />
                  : <div className="text-2xl font-bold">{k.value}</div>}
                <p className="text-xs text-muted-foreground mt-1">{k.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* File de traitement */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />File de traitement
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Commandes à préparer et en cours</p>
          </div>
          <Link to="/admin/achats/livraisons" className="flex items-center gap-1 text-xs text-primary hover:underline">
            Tout voir <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-4 py-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32 flex-1" /><Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : filePriorite.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
              Aucune commande en attente de traitement
            </div>
          ) : (
            <div className="divide-y">
              {filePriorite.map((c) => {
                const cfg  = CMD_STATUT[c.statut] ?? CMD_STATUT.brouillon;
                const Icon = cfg.icon;
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-medium text-muted-foreground">{c.reference}</p>
                      <p className="text-sm font-medium line-clamp-1">{c.client}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(c.montant)}</p>
                      <p className="text-xs text-muted-foreground">{c.date}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accès rapide */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Accès rapide</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {[
            { label: "Commandes",      icon: ClipboardList, path: "/admin/achats/livraisons",     color: "from-blue-500 to-blue-600" },
            { label: "À préparer",     icon: Package,       path: "/admin/achats/livraisons?tab=preparer", color: "from-orange-500 to-orange-600" },
            { label: "En livraison",   icon: Truck,         path: "/admin/achats/livraisons?tab=livraison", color: "from-yellow-500 to-yellow-600" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.path} to={a.path}>
                <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shadow group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-medium text-sm">{a.label}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
