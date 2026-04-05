import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, ShoppingCart, BookOpen, FileText, Calculator, Wrench,
  BarChart3, TrendingUp, Clock, CheckCircle2, Wallet,
  Package, ArrowUp, ArrowDown, Minus as MinusIcon, RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { useTicketsOuverts, useMesTickets, leadsKeys } from "../hooks/useLeads";
import { mapCmdStatut } from "../lib/commandes.constants";

// ── helpers ────────────────────────────────────────────────────────────────

function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const COMMISSION_RATE = 0.03;
export const DASHBOARD_CMD_KEY = ["dashboard-commandes-raw"] as const;

// ── dashboard ──────────────────────────────────────────────────────────────

export default function CommercialDashboard() {
  const qc = useQueryClient();

  const { data: rawCmd, isLoading: cmdLoading, isFetching: cmdFetching } = useQuery({
    queryKey: DASHBOARD_CMD_KEY,
    queryFn: async () => {
      const res = await apiClient.get<any>("/commande-clients");
      return (res.data ?? res ?? []) as any[];
    },
    staleTime: 1000 * 30,          // 30s — refresh fréquent
    refetchOnWindowFocus: true,    // sync automatique au retour sur l'onglet
  });

  const { leads: ouverts } = useTicketsOuverts();
  const { leads: mesLeads } = useMesTickets();

  const commandes = rawCmd ?? [];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: DASHBOARD_CMD_KEY });
    qc.invalidateQueries({ queryKey: leadsKeys.ouverts() });
    qc.invalidateQueries({ queryKey: leadsKeys.mesTickets() });
  };

  // ── stats dérivées (via mapCmdStatut pour cohérence) ──────────────────
  const stats = useMemo(() => {
    // Normalise tous les statuts via mapCmdStatut
    const rows = commandes.map((c: any) => ({
      ...c,
      statut: mapCmdStatut(c.etat),
    }));

    const total    = rows.length;
    const actives  = rows.filter((c) => !["livree", "annulee"].includes(c.statut)).length;
    const livrees  = rows.filter((c) => c.statut === "livree");
    const caLivre  = livrees.reduce((s: number, c: any) => s + (Number(c.montant) || 0), 0);
    const commission = caLivre * COMMISSION_RATE;

    // 6 derniers mois
    const now = new Date();
    const months: { key: string; label: string; ca: number; commissions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: fmtMonth(d.toISOString()), ca: 0, commissions: 0 });
    }
    livrees.forEach((c: any) => {
      const k = getMonthKey(c.date || c.created_at || "");
      const m = months.find((m) => m.key === k);
      if (m) { m.ca += Number(c.montant) || 0; m.commissions += (Number(c.montant) || 0) * COMMISSION_RATE; }
    });

    const lastMonth = months[months.length - 2]?.ca ?? 0;
    const thisMonth = months[months.length - 1]?.ca ?? 0;
    const mChange   = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;

    // Commandes du mois courant
    const moisKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const cmdMois = rows.filter((c: any) => (c.date || c.created_at?.split("T")[0] || "").startsWith(moisKey));

    return { total, actives, caLivre, commission, months, thisMonth, mChange, cmdMois: cmdMois.length };
  }, [commandes]);

  const totalLeads = ouverts.length + mesLeads.length;

  const quickActions = [
    { label: "Clients",    icon: Users,       path: "/admin/commercial/clients",    color: "from-blue-500 to-blue-600" },
    { label: "Mes Ventes", icon: ShoppingCart, path: "/admin/commercial/ventes",     color: "from-green-500 to-green-600" },
    { label: "Catalogue",  icon: BookOpen,     path: "/admin/commercial/catalogue",  color: "from-orange-500 to-orange-600" },
    { label: "Accréditif", icon: FileText,     path: "/admin/commercial/accreditif", color: "from-pink-500 to-pink-600" },
    { label: "Simulation", icon: Calculator,   path: "/admin/commercial/simulation", color: "from-teal-500 to-teal-600" },
    { label: "S.A.V",      icon: Wrench,       path: "/admin/commercial/sav",        color: "from-red-500 to-red-600" },
    { label: "Rapports",   icon: BarChart3,    path: "/admin/commercial/rapports",   color: "from-indigo-500 to-indigo-600" },
  ];

  const maxCa = Math.max(...stats.months.map((m) => m.ca), 1);
  const isRefreshing = cmdFetching && !cmdLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">Votre activité et performances commerciales</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Mes commandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes commandes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {cmdLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.total}</div>}
            <div className="flex items-center gap-2 mt-1">
              {cmdLoading ? <Skeleton className="h-3 w-28" /> : (
                <>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{stats.actives} actives</span>
                  <span className="text-xs text-muted-foreground">{stats.cmdMois} ce mois</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CA livré */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA livré total</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {cmdLoading ? <Skeleton className="h-8 w-28" /> : <div className="text-2xl font-bold">{formatCurrency(stats.caLivre)}</div>}
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {cmdLoading ? <Skeleton className="h-3 w-28" /> : stats.mChange !== null ? (
                <>
                  {stats.mChange > 0
                    ? <ArrowUp className="h-3 w-3 text-green-600" />
                    : stats.mChange < 0
                    ? <ArrowDown className="h-3 w-3 text-red-600" />
                    : <MinusIcon className="h-3 w-3 text-muted-foreground" />}
                  <span className={stats.mChange > 0 ? "text-green-600" : stats.mChange < 0 ? "text-red-600" : "text-muted-foreground"}>
                    {Math.abs(stats.mChange).toFixed(1)}% vs mois dernier
                  </span>
                </>
              ) : <span>Aucune donnée comparative</span>}
            </p>
          </CardContent>
        </Card>

        {/* Commission estimée */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission estimée</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {cmdLoading ? <Skeleton className="h-8 w-28" /> : <div className="text-2xl font-bold text-primary">{formatCurrency(stats.commission)}</div>}
            <p className="text-xs text-muted-foreground mt-1">
              Taux : <span className="font-semibold">{(COMMISSION_RATE * 100).toFixed(0)}%</span> du CA livré
            </p>
          </CardContent>
        </Card>

        {/* Leads actifs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads actifs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1 flex gap-1 flex-wrap">
              <span className="font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">{ouverts.length} en attente</span>
              <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{mesLeads.length} assignés</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance mensuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />CA et commissions — 6 derniers mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cmdLoading ? (
            <div className="flex items-end gap-3 h-32">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="flex-1 rounded" style={{ height: `${40 + i * 10}%` }} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Barres */}
              <div className="flex items-end gap-2 h-28">
                {stats.months.map((m) => (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end h-20 relative group">
                      {m.ca > 0 ? (
                        <>
                          <div className="w-full rounded-t bg-primary/20 relative" style={{ height: `${(m.ca / maxCa) * 100}%` }}>
                            <div className="absolute bottom-0 w-full rounded-t bg-primary transition-all" style={{ height: `${COMMISSION_RATE * 100}%` }} />
                          </div>
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border rounded px-1.5 py-0.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {formatCurrency(m.ca)}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-0.5 bg-border rounded" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Tableau mensuel */}
              <div className="rounded-lg border overflow-hidden text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="px-3 py-2 text-left font-medium">Mois</th>
                      <th className="px-3 py-2 text-right font-medium">CA livré</th>
                      <th className="px-3 py-2 text-right font-medium">Commission (3%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.months.map((m) => (
                      <tr key={m.key} className="hover:bg-muted/20">
                        <td className="px-3 py-2 capitalize">{m.label}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          {m.ca > 0 ? formatCurrency(m.ca) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {m.commissions > 0
                            ? <span className="font-semibold text-primary">{formatCurrency(m.commissions)}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/40 font-semibold">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(stats.caLivre)}</td>
                      <td className="px-3 py-2 text-right text-primary">{formatCurrency(stats.commission)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/20 border border-primary/40 inline-block" />CA livré</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" />Commission (3%)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />Commandes récentes
            <Link to="/admin/commercial/ventes" className="ml-auto text-xs text-primary hover:underline font-normal">Voir tout</Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cmdLoading ? (
            <div className="px-4 py-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32 flex-1" /><Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : commandes.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">Aucune commande enregistrée</div>
          ) : (
            <div className="divide-y">
              {commandes.slice(0, 6).map((c: any) => {
                const statut = mapCmdStatut(c.etat);
                const COLORS: Record<string, string> = {
                  livree:     "bg-green-100 text-green-800",
                  validee:    "bg-blue-100 text-blue-800",
                  en_cours:   "bg-orange-100 text-orange-800",
                  annulee:    "bg-red-100 text-red-800",
                  brouillon:  "bg-gray-100 text-gray-700",
                  en_attente: "bg-yellow-100 text-yellow-800",
                };
                const LABELS: Record<string, string> = {
                  livree: "Livrée", validee: "Validée", en_cours: "En livraison",
                  annulee: "Annulée", brouillon: "Brouillon", en_attente: "En attente",
                };
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <span className="font-mono text-xs text-muted-foreground w-28 shrink-0">
                      {c.reference || `CMD-${String(c.id).padStart(5, "0")}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {c.client ? `${c.client.nom || ""} ${c.client.prenom || ""}`.trim() || c.client.raison_sociale : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.date || c.created_at?.split("T")[0]}</p>
                    </div>
                    <span className="font-semibold text-sm whitespace-nowrap shrink-0">{formatCurrency(Number(c.montant) || 0)}</span>
                    <Badge variant="outline" className={`text-xs shrink-0 ${COLORS[statut] ?? "bg-gray-100 text-gray-700"}`}>
                      {LABELS[statut] ?? statut}
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
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {quickActions.map((a) => {
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
