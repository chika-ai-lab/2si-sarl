import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Receipt, Search, TrendingUp, AlertCircle, CheckCircle2,
  Clock, Wallet, RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FactureClient {
  id: number;
  clientId: number;
  commandeClientId: number | null;
  date: string | null;
  montant: number;
  recu: number;
  creance: number;
  etat: string;
  note: string | null;
  client?: { nom: string; prenom: string; raison_sociale?: string; telephone?: string };
  commandeClient?: { reference: string };
  createdAt: string;
}

interface FactureFournisseur {
  id: number;
  numero: string | null;
  fournisseurId: number | null;
  commandeFournisseurId: number | null;
  montant: number;
  date: string | null;
  statut: string;
  note: string | null;
  createdAt: string;
}

// ─── Config statuts ───────────────────────────────────────────────────────────

const ETAT_CLIENT: Record<string, { label: string; color: string; icon: any }> = {
  payee:     { label: "Payée",     color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  impayee:   { label: "Impayée",   color: "bg-red-100 text-red-700",      icon: AlertCircle  },
  partielle: { label: "Partielle", color: "bg-amber-100 text-amber-700",  icon: Clock        },
  en_attente:{ label: "En attente",color: "bg-gray-100 text-gray-600",    icon: Clock        },
};

const STATUT_FOURN: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-gray-100 text-gray-600"   },
  payee:      { label: "Payée",      color: "bg-green-100 text-green-700" },
  rejetee:    { label: "Rejetée",    color: "bg-red-100 text-red-700"     },
};

function clientNom(f: FactureClient) {
  if (!f.client) return `Client #${f.clientId}`;
  return (`${f.client.nom ?? ""} ${f.client.prenom ?? ""}`).trim()
    || f.client.raison_sociale
    || `Client #${f.clientId}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComptaPage() {
  const [search, setSearch]   = useState("");
  const [tab, setTab]         = useState("clients");

  // ── Fetch factures clients ────────────────────────────────────────────────
  const { data: fcRaw = [], isLoading: fcLoading, refetch: refetchFc } = useQuery({
    queryKey: ["factures-clients"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/facture-clients", { per_page: 500 });
      return (r.data ?? r ?? []) as FactureClient[];
    },
    staleTime: 1000 * 60,
  });

  // ── Fetch factures fournisseurs ───────────────────────────────────────────
  const { data: ffRaw = [], isLoading: ffLoading, refetch: refetchFf } = useQuery({
    queryKey: ["factures-fournisseurs"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/facture-fournisseurs", { per_page: 500 });
      return (r.data ?? r ?? []) as FactureFournisseur[];
    },
    staleTime: 1000 * 60,
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalFacture  = fcRaw.reduce((s, f) => s + Number(f.montant), 0);
    const totalEncaisse = fcRaw.reduce((s, f) => s + Number(f.recu), 0);
    const totalCreance  = fcRaw.reduce((s, f) => s + Number(f.creance), 0);
    const impayees      = fcRaw.filter((f) => f.etat === "impayee" || f.etat === "partielle").length;
    const totalAchat    = ffRaw.reduce((s, f) => s + Number(f.montant), 0);
    return { totalFacture, totalEncaisse, totalCreance, impayees, totalAchat };
  }, [fcRaw, ffRaw]);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const q = search.toLowerCase();

  const filteredFc = useMemo(() => fcRaw.filter((f) => {
    if (!q) return true;
    const nom = clientNom(f).toLowerCase();
    const ref = (f.commandeClient?.reference ?? "").toLowerCase();
    return nom.includes(q) || ref.includes(q) || String(f.id).includes(q);
  }), [fcRaw, q]);

  const filteredFf = useMemo(() => ffRaw.filter((f) => {
    if (!q) return true;
    return (f.numero ?? "").toLowerCase().includes(q)
      || String(f.fournisseurId ?? "").includes(q)
      || String(f.id).includes(q);
  }), [ffRaw, q]);

  const refetch = () => { refetchFc(); refetchFf(); };
  const isLoading = fcLoading || ffLoading;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Comptabilité
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consultation des factures clients et fournisseurs
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Facturé (clients)",  value: formatCurrency(stats.totalFacture),  icon: Receipt,      color: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200" },
          { label: "Encaissé",           value: formatCurrency(stats.totalEncaisse), icon: Wallet,       color: "text-green-700",   bg: "bg-green-50",   border: "border-green-200"  },
          { label: "Créances",           value: formatCurrency(stats.totalCreance),  icon: TrendingUp,   color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"  },
          { label: "Factures impayées",  value: stats.impayees,                      icon: AlertCircle,  color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",   alert: stats.impayees > 0 },
          { label: "Achats fournisseurs",value: formatCurrency(stats.totalAchat),    icon: Clock,        color: "text-gray-700",    bg: "bg-gray-50",    border: "border-gray-200"   },
        ].map(({ label, value, icon: Icon, color, bg, border, alert }) => (
          <div key={label} className={`rounded-lg border ${border} ${bg} px-3 py-2.5`}>
            <div className="flex items-center justify-between mb-0.5">
              <Icon className={`h-4 w-4 ${color} ${alert ? "animate-pulse" : ""}`} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Tabs value={tab} onValueChange={setTab} className="flex-1">
            <TabsList>
              <TabsTrigger value="clients">
                Factures clients
                {fcRaw.length > 0 && (
                  <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{fcRaw.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="fournisseurs">
                Factures fournisseurs
                {ffRaw.length > 0 && (
                  <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{ffRaw.length}</span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Chercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm w-52"
            />
          </div>
        </div>

        {/* ── Factures clients ────────────────────────────────────────────── */}
        {tab === "clients" && (
          fcLoading ? (
            <div className="space-y-1.5">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : filteredFc.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Aucune facture client</CardContent></Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 border-b">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">N°</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Commande</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Montant</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Encaissé</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Créance</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFc.map((f) => {
                    const cfg = ETAT_CLIENT[f.etat] ?? ETAT_CLIENT.en_attente;
                    const Icon = cfg.icon;
                    const hasCreance = Number(f.creance) > 0;
                    return (
                      <tr key={f.id} className={`hover:bg-muted/30 transition-colors ${hasCreance && f.etat !== "payee" ? "bg-red-50/30" : ""}`}>
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-muted-foreground">
                          FC-{String(f.id).padStart(4, "0")}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-sm">{clientNom(f)}</p>
                          {f.client?.telephone && (
                            <p className="text-xs text-muted-foreground">{f.client.telephone}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {f.commandeClient?.reference ?? (f.commandeClientId ? `CMD-${String(f.commandeClientId).padStart(5, "0")}` : "—")}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {f.date ?? f.createdAt?.split("T")[0] ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                          {formatCurrency(Number(f.montant))}
                        </td>
                        <td className="px-3 py-2.5 text-right text-green-700 whitespace-nowrap">
                          {Number(f.recu) > 0 ? formatCurrency(Number(f.recu)) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {Number(f.creance) > 0
                            ? <span className="font-semibold text-red-600">{formatCurrency(Number(f.creance))}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
                            <Icon className="h-2.5 w-2.5" />{cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Total */}
                <tfoot className="bg-muted/40 border-t font-semibold text-sm">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-xs text-muted-foreground">
                      {filteredFc.length} facture(s)
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(filteredFc.reduce((s, f) => s + Number(f.montant), 0))}</td>
                    <td className="px-3 py-2 text-right text-green-700">{formatCurrency(filteredFc.reduce((s, f) => s + Number(f.recu), 0))}</td>
                    <td className="px-3 py-2 text-right text-red-600">{formatCurrency(filteredFc.reduce((s, f) => s + Number(f.creance), 0))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}

        {/* ── Factures fournisseurs ───────────────────────────────────────── */}
        {tab === "fournisseurs" && (
          ffLoading ? (
            <div className="space-y-1.5">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : filteredFf.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Aucune facture fournisseur</CardContent></Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 border-b">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">N°</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Référence</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fournisseur</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Commande CF</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Montant</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFf.map((f) => {
                    const cfg = STATUT_FOURN[f.statut] ?? STATUT_FOURN.en_attente;
                    return (
                      <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-muted-foreground">
                          FF-{String(f.id).padStart(4, "0")}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">
                          {f.numero ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-sm">
                          {f.fournisseurId ? `Fournisseur #${f.fournisseurId}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {f.commandeFournisseurId ? `CF-${String(f.commandeFournisseurId).padStart(4, "0")}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {f.date ?? f.createdAt?.split("T")[0] ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                          {formatCurrency(Number(f.montant))}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/40 border-t font-semibold text-sm">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-xs text-muted-foreground">
                      {filteredFf.length} facture(s)
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(filteredFf.reduce((s, f) => s + Number(f.montant), 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
