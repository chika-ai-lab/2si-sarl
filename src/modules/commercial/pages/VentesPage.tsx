import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Package, Pencil, Plus, RefreshCw, Search, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { useClients } from "../hooks/useClients";
import { useTicketsOuverts, useMesTickets, type Lead } from "../hooks/useLeads";
import { CMD_STATUT, mapCmdStatut, MODES_PAIEMENT } from "../lib/commandes.constants";
import { LeadsTable } from "../components/LeadsTable";
import { CreateCommandeDialog } from "../components/CreateCommandeDialog";
import type { BackendArticle } from "../components/ProductPickerSheet";

// ── Types ─────────────────────────────────────────────────────────────────

interface CommandeRow {
  id: string;
  reference: string;
  statut: string;
  date: string;
  client: string;
  telephone: string;
  articles: number;
  total: number;
  modePaiement: string | null;
}

// ── Query ─────────────────────────────────────────────────────────────────

export const COMMERCIAL_COMMANDES_KEY = ["ventes-commandes"] as const;

async function fetchCommandes(): Promise<CommandeRow[]> {
  const res = await apiClient.get<any>("/commande-clients");
  return (res.data ?? res ?? []).map((c: any) => ({
    id:           String(c.id),
    reference:    c.reference || `CMD-${String(c.id).padStart(5, "0")}`,
    statut:       mapCmdStatut(c.etat),
    date:         c.date || c.created_at?.split("T")[0] || "",
    client:       c.client ? (`${c.client.nom || ""} ${c.client.prenom || ""}`).trim() || c.client.raison_sociale : "—",
    telephone:    c.client?.telephone || "",
    articles:     (c.articles || []).length,
    total:        Number(c.montant) || 0,
    modePaiement: c.mode_paiement || null,
  }));
}

// ── CommandesTab ──────────────────────────────────────────────────────────

function CommandesTab({ onOpenCreate, onEdit }: { onOpenCreate: () => void; onEdit: (id: string) => void }) {
  const qc = useQueryClient();
  const { data: commandes = [], isLoading } = useQuery({
    queryKey: COMMERCIAL_COMMANDES_KEY,
    queryFn:  fetchCommandes,
    staleTime: 1000 * 60 * 2,
  });

  const [search, setSearch]     = useState("");
  const [statut, setStatut]     = useState("all");
  const [paiement, setPaiement] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return commandes.filter((c) => {
      if (statut !== "all" && c.statut !== statut) return false;
      if (paiement !== "all" && (c.modePaiement ?? "") !== paiement) return false;
      if (q && !c.reference.toLowerCase().includes(q) && !c.client.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [commandes, search, statut, paiement]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Vos commandes enregistrées</p>
        <Button size="sm" onClick={onOpenCreate}>
          <Plus className="h-4 w-4 mr-1.5" />Nouvelle commande
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Référence, client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {Object.entries(CMD_STATUT).map(([v, c]) => <SelectItem key={v} value={v}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={paiement} onValueChange={setPaiement}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Paiement" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout mode</SelectItem>
            {MODES_PAIEMENT.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-36 flex-1" />
              <Skeleton className="h-6 w-20" /><Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{search || statut !== "all" ? "Aucun résultat." : "Aucune commande pour le moment."}</p>
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
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const cfg  = CMD_STATUT[c.statut] ?? CMD_STATUT.brouillon;
                const Icon = cfg.icon;
                const editable = !["livree", "annulee"].includes(c.statut);
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
                    <TableCell className="text-right font-semibold text-sm whitespace-nowrap">{formatCurrency(c.total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                        <Icon className="h-3 w-3 mr-1" />{cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-3">
                      {editable && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(c.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
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

// ── Page ──────────────────────────────────────────────────────────────────

export default function VentesPage() {
  const { leads: ouverts,  setLeads: setOuverts,  loading: l1, reload: r1 } = useTicketsOuverts();
  const { leads: mesLeads, setLeads: setMesLeads, loading: l2, reload: r2 } = useMesTickets();
  const reloadLeads = () => { r1(); r2(); };

  const removeFromOuverts  = (id: number) => setOuverts((p) => p.filter((l) => l.id !== id));
  const rollbackToOuverts  = (lead: Lead)  => setOuverts((p) => [lead, ...p]);
  const removeFromMesLeads = (id: number) => setMesLeads((p) => p.filter((l) => l.id !== id));
  const rollbackToMesLeads = (lead: Lead)  => setMesLeads((p) => [lead, ...p]);

  const { data: articles = [] } = useQuery<BackendArticle[]>({
    queryKey: ["articles-list"],
    queryFn:  async () => { const r = await apiClient.get<any>("/articles"); return r.data ?? r ?? []; },
    staleTime: 1000 * 60 * 10,
  });

  const { data: clientsData } = useClients({ limit: 1000 });
  const clients = clientsData?.data ?? [];

  const qc = useQueryClient();
  const { data: commandes = [] } = useQuery<CommandeRow[]>({
    queryKey: COMMERCIAL_COMMANDES_KEY,
    queryFn:  fetchCommandes,
    staleTime: 1000 * 60 * 2,
  });
  const activeCount = commandes.filter((c) => !["livree", "annulee"].includes(c.statut)).length;

  const [createOpen, setCreateOpen] = useState(false);
  const [editId,     setEditId]     = useState<string | undefined>();

  const handleCreated = () => qc.invalidateQueries({ queryKey: COMMERCIAL_COMMANDES_KEY });

  return (
    <>
      <CreateCommandeDialog
        open={createOpen || !!editId}
        onClose={() => { setCreateOpen(false); setEditId(undefined); }}
        onCreated={handleCreated}
        articles={articles}
        clients={clients}
        editCommandeId={editId}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes Ventes</h1>
            <p className="text-muted-foreground text-sm">Acquisition et suivi des leads clients</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { reloadLeads(); qc.invalidateQueries({ queryKey: COMMERCIAL_COMMANDES_KEY }); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Actualiser
          </Button>
        </div>

        <Tabs defaultValue="ouverts">
          <TabsList>
            <TabsTrigger value="ouverts">
              File d'attente
              {ouverts.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-yellow-500 text-white text-xs font-bold">
                  {ouverts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="mes-tickets">
              Mes tickets
              {mesLeads.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-white text-xs font-bold">
                  {mesLeads.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="commandes">
              Commandes
              {activeCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {activeCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ouverts" className="mt-4">
            <LeadsTable leads={ouverts} loading={l1} emptyIcon={ClipboardList}
              emptyText="Aucun ticket ouvert dans votre zone." onAction={reloadLeads}
              onOptimisticRemove={removeFromOuverts} onRollback={rollbackToOuverts} />
          </TabsContent>

          <TabsContent value="mes-tickets" className="mt-4">
            <LeadsTable leads={mesLeads} loading={l2} emptyIcon={ClipboardList}
              emptyText="Aucun ticket assigné pour le moment." onAction={reloadLeads}
              onOptimisticRemove={removeFromMesLeads} onRollback={rollbackToMesLeads} />
          </TabsContent>

          <TabsContent value="commandes" className="mt-4">
            <CommandesTab onOpenCreate={() => setCreateOpen(true)} onEdit={(id) => setEditId(id)} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
