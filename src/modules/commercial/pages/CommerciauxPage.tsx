import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, TrendingUp, ShoppingCart, CheckCircle2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { mapCmdStatut } from "../lib/commandes.constants";

// ── Types ──────────────────────────────────────────────────────────────────

interface BackendUser {
  id: number;
  name: string;
  email: string;
  photo?: string;
  roles?: Array<{ id: number; title: string }>;
}

interface RawCommande {
  id: number;
  etat: string;
  montant: string | number;
  user_id: number | null;
  commercial_id?: number | null;
}

interface CommercialStats {
  user: BackendUser;
  total: number;   // nb commandes
  ca: number;   // chiffre d'affaires (FCFA)
  actives: number;   // commandes non-livrées non-annulées
  livrees: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-fuchsia-500",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function isCommercialRole(roles?: Array<{ title: string }>) {
  if (!roles?.length) return false;
  const COMMERCIAL_ROLES = ["commercial", "vendeur", "vendeuse", "sales", "salesman"];
  return roles.some((r) => COMMERCIAL_ROLES.includes(r.title.toLowerCase().trim()));
}

// ── Fetch ──────────────────────────────────────────────────────────────────

async function fetchCommerciauxStats(): Promise<CommercialStats[]> {
  const [usersRaw, commandesRaw] = await Promise.all([
    apiClient.get<any>("/users"),
    apiClient.get<any>("/commande-clients", { per_page: 500 }),
  ]);

  const users: BackendUser[] = Array.isArray(usersRaw) ? usersRaw : (usersRaw?.data ?? []);
  const commandes: RawCommande[] = Array.isArray(commandesRaw) ? commandesRaw : (commandesRaw?.data ?? []);

  // Keep only commercial-role users
  const commerciaux = users.filter((u) => isCommercialRole(u.roles));

  return commerciaux.map((user) => {
    const mine = commandes.filter((c) => {
      const uid = c.commercial_id ?? c.user_id;
      return uid === user.id;
    });

    const ca = mine.reduce((s, c) => s + Number(c.montant || 0), 0);
    const statuts = mine.map((c) => mapCmdStatut(c.etat));
    const livrees = statuts.filter((s) => s === "livree").length;
    const actives = statuts.filter((s) => !["livree", "annulee"].includes(s)).length;

    return { user, total: mine.length, ca, actives, livrees };
  });
}

// ── Card ───────────────────────────────────────────────────────────────────

function CommercialCard({ stat, onClick }: { stat: CommercialStats; onClick: () => void }) {
  const { user, total, ca, actives, livrees } = stat;
  const taux = total > 0 ? Math.round((livrees / total) * 100) : 0;

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden"
    >
      {/* Accent bar */}
      <div className={`h-1 w-full ${avatarColor(user.id)}`} />

      <CardContent className="pt-5 pb-4 px-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-11 w-11 rounded-full ${avatarColor(user.id)} flex items-center justify-center shrink-0`}>
            <span className="text-white font-bold text-sm">{getInitials(user.name)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 px-2 py-2.5">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="font-bold text-sm">{total}</p>
            <p className="text-[10px] text-muted-foreground">Commandes</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-2 py-2.5">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="font-bold text-sm">{taux}%</p>
            <p className="text-[10px] text-muted-foreground">Taux livr.</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-2 py-2.5">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="font-bold text-sm">{actives}</p>
            <p className="text-[10px] text-muted-foreground">En cours</p>
          </div>
        </div>

        {/* CA */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">CA total</span>
          <span className="text-sm font-semibold">{formatCurrency(ca)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="h-1 bg-muted" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function CommerciauxPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["commerciaux-stats"],
    queryFn: fetchCommerciauxStats,
    staleTime: 1000 * 60 * 3,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stats.filter((s) =>
      !q || s.user.name.toLowerCase().includes(q) || s.user.email.toLowerCase().includes(q)
    );
  }, [stats, search]);

  // Summary KPIs
  const totalCA = stats.reduce((s, c) => s + c.ca, 0);
  const totalCmds = stats.reduce((s, c) => s + c.total, 0);
  const totalActives = stats.reduce((s, c) => s + c.actives, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Équipe Commerciale
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isLoading ? "Chargement…" : `${stats.length} commercial${stats.length !== 1 ? "aux" : ""}`}
          </p>
        </div>
      </div>

      {/* Global KPIs */}
      {!isLoading && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "CA total", value: formatCurrency(totalCA), icon: TrendingUp, color: "text-emerald-600" },
            { label: "Commandes", value: String(totalCmds), icon: ShoppingCart, color: "text-blue-600" },
            { label: "En cours", value: String(totalActives), icon: CheckCircle2, color: "text-amber-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
              <div className={`${color} rounded-lg bg-current/10 p-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-bold text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un commercial…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Aucun commercial trouvé</p>
          {search && <p className="text-sm mt-1">Essayez un autre terme de recherche.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((stat) => (
            <CommercialCard
              key={stat.user.id}
              stat={stat}
              onClick={() => navigate(`/admin/commercial/commerciaux/${stat.user.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
