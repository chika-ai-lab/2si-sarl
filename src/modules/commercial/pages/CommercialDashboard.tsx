import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList, AlertCircle, CheckCircle2, Store, UserCheck,
  Building2, RefreshCw, ArrowRight, Package, TrendingUp, Receipt,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { mapCmdStatut } from "../lib/commandes.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Agence { id: number; agence: string; region: { id: number; region: string } }

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function CommercialDashboard() {
  const qc = useQueryClient();

  const { data: rawCmd = [], isLoading: cmdLoading, isFetching } = useQuery({
    queryKey: ["dashboard-commandes-raw"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/commande-clients", { per_page: 500 });
      return (r.data ?? r ?? []) as any[];
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const { data: agences = [] } = useQuery<Agence[]>({
    queryKey: ["agences-list"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/agences");
      return (Array.isArray(r) ? r : r?.data ?? []) as Agence[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: bdcRaw } = useQuery({
    queryKey: ["bon-commandes"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/bon-commandes", { per_page: 200 });
      return r.data ?? r ?? [];
    },
    staleTime: 1000 * 60,
  });
  const bdcs: any[] = bdcRaw ?? [];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["dashboard-commandes-raw"] });
    qc.invalidateQueries({ queryKey: ["bon-commandes"] });
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const cmds = rawCmd.map((c: any) => ({
      ...c,
      statut:    mapCmdStatut(c.etat),
      agenceId:  c.agenceId ?? c.agence_id ?? null,
      source:    c.userId || c.user_id ? "terrain" : "marketplace",
      montant:   Number(c.montant) || 0,
      agenceNom: c.agence?.agence ?? null,
      regionNom: c.agence?.region?.region ?? null,
    }));

    const total        = cmds.length;
    const nonAssignees = cmds.filter((c: any) => !c.agenceId);
    const terrain      = cmds.filter((c: any) => c.source === "terrain").length;
    const marketplace  = cmds.filter((c: any) => c.source === "marketplace").length;
    const validees     = cmds.filter((c: any) => c.statut === "validee").length;
    const montantTotal = cmds.reduce((s: number, c: any) => s + c.montant, 0);

    // Par agence
    const parAgence = new Map<string, { nom: string; count: number; montant: number }>();
    for (const c of cmds) {
      if (!c.agenceId) continue;
      const key = c.agenceNom ?? `Agence #${c.agenceId}`;
      const prev = parAgence.get(key) ?? { nom: key, count: 0, montant: 0 };
      parAgence.set(key, { ...prev, count: prev.count + 1, montant: prev.montant + c.montant });
    }
    const agenceList = [...parAgence.values()].sort((a, b) => b.count - a.count);

    // BDC stats
    const bdcCeMois = bdcs.filter((b: any) => {
      const d = b.createdAt ?? b.date ?? "";
      return d.startsWith(new Date().toISOString().slice(0, 7));
    }).length;

    return { total, nonAssignees: nonAssignees.length, terrain, marketplace, validees, montantTotal, agenceList, bdcCeMois };
  }, [rawCmd, bdcs]);

  const isRefreshing = isFetching && !cmdLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vue d'ensemble — réception et traitement des commandes
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Non assignées — priorité haute */}
        <Card className={stats.nonAssignees > 0 ? "border-amber-300 bg-amber-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                {cmdLoading
                  ? <Skeleton className="h-8 w-10 mb-1" />
                  : <p className="text-3xl font-bold text-amber-700">{stats.nonAssignees}</p>}
                <p className="text-xs font-medium text-amber-700">Non assignées</p>
                <p className="text-xs text-muted-foreground mt-0.5">à traiter en priorité</p>
              </div>
              <AlertCircle className={`h-8 w-8 ${stats.nonAssignees > 0 ? "text-amber-500" : "text-gray-300"}`} />
            </div>
            {stats.nonAssignees > 0 && (
              <Link to="/admin/commercial/commandes" className="mt-3 flex items-center gap-1 text-xs text-amber-700 font-medium hover:underline">
                Traiter maintenant <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Total commandes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                {cmdLoading
                  ? <Skeleton className="h-8 w-10 mb-1" />
                  : <p className="text-3xl font-bold">{stats.total}</p>}
                <p className="text-xs font-medium text-muted-foreground">Total commandes</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.validees} validées</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* BDC créés ce mois */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-green-700">{stats.bdcCeMois}</p>
                <p className="text-xs font-medium text-muted-foreground">BDC ce mois</p>
                <p className="text-xs text-muted-foreground mt-0.5">bons de commande créés</p>
              </div>
              <ClipboardList className="h-8 w-8 text-green-500" />
            </div>
            <Link to="/admin/achats/bon-commandes" className="mt-3 flex items-center gap-1 text-xs text-green-700 font-medium hover:underline">
              Voir logistique <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Montant total */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                {cmdLoading
                  ? <Skeleton className="h-8 w-28 mb-1" />
                  : <p className="text-2xl font-bold leading-tight">{formatCurrency(stats.montantTotal)}</p>}
                <p className="text-xs font-medium text-muted-foreground">Valeur totale</p>
                <p className="text-xs text-muted-foreground mt-0.5">toutes commandes</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Répartition par source
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {cmdLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6" /><Skeleton className="h-6" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 w-28 shrink-0">
                    <UserCheck className="h-3 w-3" />Terrain
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: stats.total > 0 ? `${(stats.terrain / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{stats.terrain}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded px-2 py-1 w-28 shrink-0">
                    <Store className="h-3 w-3" />Marketplace
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: stats.total > 0 ? `${(stats.marketplace / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{stats.marketplace}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Par agence */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Commandes par agence
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {cmdLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6" />)}
              </div>
            ) : stats.agenceList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Aucune commande assignée</p>
            ) : (
              <div className="space-y-2">
                {stats.agenceList.slice(0, 6).map(({ nom, count, montant }) => (
                  <div key={nom} className="flex items-center gap-2 text-sm">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 font-medium truncate">{nom}</span>
                    <span className="text-xs text-muted-foreground">{count} cmd</span>
                    <span className="text-xs font-semibold text-right w-28">{formatCurrency(montant)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commandes récentes non assignées */}
      {stats.nonAssignees > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4" />
              Commandes sans agence — à traiter
              <Link to="/admin/commercial/commandes" className="ml-auto text-xs font-normal text-amber-700 hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="divide-y">
              {rawCmd
                .filter((c: any) => !(c.agenceId ?? c.agence_id))
                .slice(0, 5)
                .map((c: any) => {
                  const ref = c.reference || `CMD-${String(c.id).padStart(5, "0")}`;
                  const client = c.client
                    ? (`${c.client.nom ?? ""} ${c.client.prenom ?? ""}`).trim() || c.client.raison_sociale || "—"
                    : "—";
                  const source = c.userId || c.user_id ? "terrain" : "marketplace";
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/50">
                      <span className="font-mono text-xs font-semibold text-muted-foreground w-28 shrink-0">{ref}</span>
                      <span className="flex-1 text-sm font-medium">{client}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        source === "terrain"
                          ? "bg-green-50 text-green-700"
                          : "bg-purple-50 text-purple-700"
                      }`}>
                        {source === "terrain" ? "Terrain" : "Marketplace"}
                      </span>
                      <span className="text-sm font-semibold text-right w-28">{formatCurrency(Number(c.montant) || 0)}</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accès rapide */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Commandes",     path: "/admin/commercial/commandes",  icon: ClipboardList, color: "from-primary to-primary/80",   desc: "Réception & assignation" },
            { label: "Bons Commande", path: "/admin/achats/bon-commandes",  icon: CheckCircle2,  color: "from-green-500 to-green-600",   desc: "Transmis à logistique" },
            { label: "Factures",       path: "/admin/commercial/factures",   icon: Receipt,       color: "from-indigo-500 to-indigo-600", desc: "Factures & créances" },
            { label: "Clients",       path: "/admin/commercial/clients",    icon: Building2,     color: "from-blue-500 to-blue-600",    desc: "Gestion clients" },
          ].map(({ label, path, icon: Icon, color, desc }) => (
            <Link key={path} to={path}>
              <Card className="hover:border-primary/40 transition-all hover:shadow-sm cursor-pointer group h-full">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
