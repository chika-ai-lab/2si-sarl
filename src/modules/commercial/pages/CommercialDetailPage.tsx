import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, TrendingUp, ShoppingCart, CheckCircle2, XCircle, Package,
  Search, Mail, User,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { CMD_STATUT, mapCmdStatut, MODES_PAIEMENT } from "../lib/commandes.constants";

// ── Types ──────────────────────────────────────────────────────────────────

interface BackendUser {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ id: number; title: string }>;
}

interface CommercialCommande {
  id:           string;
  reference:    string;
  statut:       string;
  date:         string;
  client:       string;
  telephone:    string;
  articles:     number;
  total:        number;
  modePaiement: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const AVATAR_COLORS = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-violet-500 to-violet-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-indigo-500 to-indigo-600",
  "from-fuchsia-500 to-fuchsia-600",
];
function avatarGradient(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ── Fetch ──────────────────────────────────────────────────────────────────

async function fetchCommercialDetail(userId: string) {
  const [usersRaw, commandesRaw] = await Promise.all([
    apiClient.get<any>("/users"),
    apiClient.get<any>("/commande-clients", { per_page: 500 }),
  ]);

  const users: BackendUser[] = Array.isArray(usersRaw) ? usersRaw : (usersRaw?.data ?? []);
  const user = users.find((u) => String(u.id) === userId);
  if (!user) throw new Error("Commercial introuvable");

  const allCommandes: any[] = Array.isArray(commandesRaw) ? commandesRaw : (commandesRaw?.data ?? []);
  const mine = allCommandes.filter((c) => {
    const uid = c.commercial_id ?? c.user_id;
    return String(uid) === userId;
  });

  const commandes: CommercialCommande[] = mine.map((c: any) => ({
    id:           String(c.id),
    reference:    c.reference || `CMD-${String(c.id).padStart(5, "0")}`,
    statut:       mapCmdStatut(c.etat),
    date:         c.date || c.created_at?.split("T")[0] || "",
    client:       c.client ? (`${c.client.nom || ""} ${c.client.prenom || ""}`).trim() || c.client.raison_sociale || "—" : "—",
    telephone:    c.client?.telephone || "",
    articles:     (c.articles || []).length,
    total:        Number(c.montant) || 0,
    modePaiement: c.mode_paiement || null,
  }));

  return { user, commandes };
}

// ── KPI card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4 flex items-start gap-4">
      <div className={`rounded-xl ${color} p-2.5 shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold text-xl leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Commandes tab ──────────────────────────────────────────────────────────

function CommandesTab({ commandes }: { commandes: CommercialCommande[] }) {
  const [search,   setSearch]   = useState("");
  const [statut,   setStatut]   = useState("all");
  const [paiement, setPaiement] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return commandes.filter((c) => {
      if (statut   !== "all" && c.statut              !== statut)   return false;
      if (paiement !== "all" && (c.modePaiement ?? "") !== paiement) return false;
      if (q && !c.reference.toLowerCase().includes(q) && !c.client.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [commandes, search, statut, paiement]);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Référence, client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {Object.entries(CMD_STATUT).map(([v, c]) => (
              <SelectItem key={v} value={v}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paiement} onValueChange={setPaiement}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Paiement" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout mode</SelectItem>
            {MODES_PAIEMENT.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-25" />
          <p className="text-sm">{search || statut !== "all" ? "Aucun résultat." : "Aucune commande."}</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs whitespace-nowrap">Référence</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Client</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Date</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Mode paiement</TableHead>
                <TableHead className="text-xs text-center whitespace-nowrap w-16">Articles</TableHead>
                <TableHead className="text-xs text-right whitespace-nowrap">Total</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const cfg  = CMD_STATUT[c.statut] ?? CMD_STATUT.brouillon;
                const Icon = cfg.icon;
                return (
                  <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-medium whitespace-nowrap">{c.reference}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="font-medium text-sm">{c.client}</p>
                      {c.telephone && <p className="text-xs text-muted-foreground">{c.telephone}</p>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{c.date}</TableCell>
                    <TableCell>
                      {c.modePaiement
                        ? <Badge variant="outline" className="text-xs capitalize">{c.modePaiement}</Badge>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3 w-3" />{c.articles}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm whitespace-nowrap">
                      {formatCurrency(c.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                        <Icon className="h-3 w-3 mr-1" />{cfg.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-right">{filtered.length} commande(s)</p>
    </div>
  );
}

// ── Performance tab ────────────────────────────────────────────────────────

function PerformanceTab({ commandes }: { commandes: CommercialCommande[] }) {
  const byStatut = useMemo(() => {
    const counts: Record<string, number> = {};
    const amounts: Record<string, number> = {};
    commandes.forEach((c) => {
      counts[c.statut]  = (counts[c.statut]  || 0) + 1;
      amounts[c.statut] = (amounts[c.statut] || 0) + c.total;
    });
    return Object.entries(CMD_STATUT).map(([key, cfg]) => ({
      key,
      label:  cfg.label,
      color:  cfg.color,
      icon:   cfg.icon,
      count:  counts[key]  || 0,
      amount: amounts[key] || 0,
    })).filter((s) => s.count > 0);
  }, [commandes]);

  const byMode = useMemo(() => {
    const map: Record<string, number> = {};
    commandes.forEach((c) => {
      const m = c.modePaiement || "Non défini";
      map[m] = (map[m] || 0) + c.total;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([mode, total]) => ({ mode, total }));
  }, [commandes]);

  const total    = commandes.length;
  const ca       = commandes.reduce((s, c) => s + c.total, 0);
  const livrees  = commandes.filter((c) => c.statut === "livree").length;
  const annulees = commandes.filter((c) => c.statut === "annulee").length;
  const taux     = total > 0 ? Math.round((livrees / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Statut breakdown */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Répartition par statut</h3>
        <div className="space-y-2">
          {byStatut.map(({ key, label, color, icon: Icon, count, amount }) => (
            <div key={key} className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <Badge variant="outline" className={`text-xs shrink-0 ${color}`}>
                <Icon className="h-3 w-3 mr-1" />{label}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{count} commande{count > 1 ? "s" : ""}</span>
                  <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full"
                    style={{ width: `${Math.round((count / total) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                {Math.round((count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode paiement */}
      {byMode.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Répartition par mode de paiement</h3>
          <div className="space-y-2">
            {byMode.map(({ mode, total: amt }) => (
              <div key={mode} className="flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm">
                <span className="capitalize font-medium">{mode}</span>
                <span className="text-muted-foreground">{formatCurrency(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-xl border bg-muted/30 px-5 py-4 space-y-2 text-sm">
        <h3 className="font-semibold mb-3">Synthèse</h3>
        {[
          { label: "CA total",          value: formatCurrency(ca)         },
          { label: "Total commandes",   value: String(total)              },
          { label: "Livrées",           value: `${livrees} (${taux}%)`    },
          { label: "Annulées",          value: String(annulees)           },
          { label: "Panier moyen",      value: total > 0 ? formatCurrency(ca / total) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function CommercialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["commercial-detail", id],
    queryFn:  () => fetchCommercialDetail(id!),
    enabled:  !!id,
    staleTime: 1000 * 60 * 3,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-3 opacity-25" />
        <p className="font-medium">Commercial introuvable</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
    );
  }

  const { user, commandes } = data;
  const ca       = commandes.reduce((s, c) => s + c.total, 0);
  const actives  = commandes.filter((c) => !["livree", "annulee"].includes(c.statut)).length;
  const livrees  = commandes.filter((c) => c.statut === "livree").length;
  const annulees = commandes.filter((c) => c.statut === "annulee").length;

  return (
    <div className="space-y-6">

      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Retour à l'équipe
      </Button>

      {/* Hero header */}
      <div className="flex items-center gap-5">
        <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${avatarGradient(user.id)} flex items-center justify-center shrink-0 shadow-md`}>
          <span className="text-white font-bold text-2xl">{getInitials(user.name)}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {user.email}
          </div>
          {user.roles && user.roles.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {user.roles.map((r, i) => (
                <Badge key={`${r.id}-${i}`} variant="secondary" className="text-xs capitalize">
                  {r.title}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="CA total"         value={formatCurrency(ca)}      icon={TrendingUp}   color="bg-emerald-500" />
        <KpiCard label="Commandes"        value={String(commandes.length)} icon={ShoppingCart} color="bg-blue-500"    />
        <KpiCard label="En cours"         value={String(actives)}          icon={CheckCircle2} color="bg-amber-500"   />
        <KpiCard label="Livrées / Annulées" value={`${livrees} / ${annulees}`} icon={XCircle}  color="bg-slate-500"   />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="commandes">
        <TabsList>
          <TabsTrigger value="commandes">
            Commandes
            {commandes.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
                {commandes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="commandes" className="mt-4">
          <CommandesTab commandes={commandes} />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          {commandes.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground text-sm">
              Aucune donnée disponible.
            </div>
          ) : (
            <PerformanceTab commandes={commandes} />
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}
