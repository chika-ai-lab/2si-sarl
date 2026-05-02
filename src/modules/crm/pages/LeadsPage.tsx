import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  UserPlus, Search, Plus, TrendingUp, Clock, CheckCircle, XCircle,
  Mail, Phone, Building2, Edit, Trash2, ArrowRight, Loader2, MapPin,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────

type ClientStatut = "actif" | "inactif" | "suspendu";
type ClientType   = "particulier" | "professionnel";

const CANAUX_ACQUISITION = [
  { value: "bouche_a_oreille", label: "Bouche à oreille" },
  { value: "google",           label: "Google / Moteur de recherche" },
  { value: "facebook",         label: "Facebook / Instagram" },
  { value: "linkedin",         label: "LinkedIn" },
  { value: "recommandation",   label: "Recommandation client" },
  { value: "appel_entrant",    label: "Appel entrant" },
  { value: "salon",            label: "Salon / Événement" },
  { value: "autre",            label: "Autre" },
];

const REGIONS_SENEGAL = [
  "Dakar", "Thiès", "Diourbel", "Fatick", "Kaolack", "Kaffrine",
  "Saint-Louis", "Louga", "Matam", "Tambacounda", "Kédougou",
  "Kolda", "Sédhiou", "Ziguinchor",
];

const STATUT_CONFIG: Record<ClientStatut, { label: string; color: string; icon: React.ElementType }> = {
  actif:    { label: "Actif",    color: "bg-green-100 text-green-800",  icon: CheckCircle },
  inactif:  { label: "Prospect", color: "bg-blue-100 text-blue-800",    icon: Clock },
  suspendu: { label: "Suspendu", color: "bg-red-100 text-red-800",      icon: XCircle },
};

interface Prospect {
  id: string;
  nom: string;
  prenom?: string;
  raison_sociale?: string;
  type: ClientType;
  email: string;
  telephone?: string;
  telephone_secondaire?: string;
  adresse?: string;
  localisation?: string;
  canal_acquisition?: string;
  statut: ClientStatut;
  commercial_id?: number;
  commercial_nom?: string;
  notes?: string;
  created_at: string;
}

interface Commercial {
  id: number;
  name: string;
}

// Parse l'adresse qu'elle soit JSON ou texte brut
function parseAdresse(raw?: string): string {
  if (!raw) return "";
  try {
    const obj = JSON.parse(raw);
    return [obj.rue, obj.ville, obj.codePostal, obj.pays]
      .filter(Boolean).join(", ");
  } catch {
    return raw;
  }
}

const EMPTY_FORM = {
  nom: "", prenom: "", raison_sociale: "", type: "particulier" as ClientType,
  email: "", telephone: "", telephone_secondaire: "", adresse: "",
  localisation: "", canal_acquisition: "", statut: "inactif" as ClientStatut,
  commercial_id: "", notes: "",
};

// ── Composant principal ────────────────────────────────────────────────────

export function LeadsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((r) =>
    r.toLowerCase().includes("admin")
  ) ?? false;

  const [prospects, setProspects]   = useState<Prospect[]>([]);
  const [commerciaux, setCommerciaux] = useState<Commercial[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statutFilter, setStatutFilter] = useState<ClientStatut | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  // ── Chargement ────────────────────────────────────────────────────────

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [clientsRes, usersRes] = await Promise.all([
        apiClient.get<any>("/clients"),
        apiClient.get<any>("/users"),
      ]);

      const clients: any[] = clientsRes.data ?? clientsRes ?? [];
      setProspects(clients.map((c: any): Prospect => ({
        id:                  String(c.id),
        nom:                 c.nom ?? "",
        prenom:              c.prenom ?? "",
        raison_sociale:      c.raison_sociale ?? "",
        type:                (c.type ?? "particulier") as ClientType,
        email:               c.email ?? "",
        telephone:           c.telephone ?? "",
        telephone_secondaire: c.telephone_secondaire ?? "",
        adresse:             parseAdresse(c.adresse),
        localisation:        c.localisation ?? "",
        canal_acquisition:   c.canal_acquisition ?? "",
        statut:              (c.statut ?? "inactif") as ClientStatut,
        commercial_id:       c.commercial_id ?? undefined,
        commercial_nom:      c.commercial?.name ?? "",
        notes:               c.notes ?? "",
        created_at:          c.created_at?.slice(0, 10) ?? "",
      })));

      const users: any[] = usersRes.data ?? usersRes ?? [];
      setCommerciaux(users.map((u: any) => ({ id: u.id, name: u.name })));
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur de chargement", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filtres ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter((p) => {
      const matchSearch = !q ||
        p.nom.toLowerCase().includes(q) ||
        (p.prenom?.toLowerCase().includes(q) ?? false) ||
        (p.raison_sociale?.toLowerCase().includes(q) ?? false) ||
        p.email.toLowerCase().includes(q) ||
        (p.telephone?.includes(q) ?? false);
      const matchStatut = statutFilter === "all" || p.statut === statutFilter;
      return matchSearch && matchStatut;
    });
  }, [prospects, search, statutFilter]);

  // ── CRUD ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditId(null);
    // Un commercial est automatiquement assigné à ses propres prospects
    setForm({
      ...EMPTY_FORM,
      commercial_id: !isAdmin && user?.id ? user.id : "",
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Prospect) => {
    setEditId(p.id);
    setForm({
      nom:                 p.nom,
      prenom:              p.prenom ?? "",
      raison_sociale:      p.raison_sociale ?? "",
      type:                p.type,
      email:               p.email,
      telephone:           p.telephone ?? "",
      telephone_secondaire: p.telephone_secondaire ?? "",
      adresse:             parseAdresse(p.adresse),
      localisation:        p.localisation ?? "",
      canal_acquisition:   p.canal_acquisition ?? "",
      statut:              p.statut,
      commercial_id:       p.commercial_id ? String(p.commercial_id) : "",
      notes:               p.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" }); return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: "Email invalide", variant: "destructive" }); return;
    }
    if (!form.telephone.trim()) {
      toast({ title: "Le téléphone est obligatoire", variant: "destructive" }); return;
    }

    setSaving(true);
    const payload: Record<string, any> = {
      nom:                 form.nom,
      prenom:              form.prenom || null,
      raison_sociale:      form.type === "professionnel" ? form.raison_sociale || null : null,
      type:                form.type,
      email:               form.email,
      telephone:           form.telephone,
      telephone_secondaire: form.telephone_secondaire || null,
      adresse:             form.adresse || null,
      localisation:        form.localisation || null,
      canal_acquisition:   form.canal_acquisition || null,
      statut:              form.statut,
      commercial_id:       form.commercial_id ? parseInt(form.commercial_id) : null,
      notes:               form.notes || null,
    };

    try {
      if (editId) {
        await apiClient.put(`/clients/${editId}`, payload);
        toast({ title: "Prospect mis à jour" });
      } else {
        await apiClient.post("/clients", payload);
        toast({ title: "Prospect créé" });
      }
      setDialogOpen(false);
      fetchAll(true);
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.message ?? "Erreur lors de la sauvegarde", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce prospect ?")) return;
    try {
      await apiClient.delete(`/clients/${id}`);
      setProspects((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Prospect supprimé" });
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  // ── KPIs ──────────────────────────────────────────────────────────────

  const stats = {
    total:    prospects.length,
    actifs:   prospects.filter((p) => p.statut === "actif").length,
    prospects: prospects.filter((p) => p.statut === "inactif").length,
    suspendus: prospects.filter((p) => p.statut === "suspendu").length,
  };

  // ── Rendu ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-12" /></CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* ── Dialog formulaire ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le prospect" : "Nouveau prospect"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">

            {/* Type de client */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type de client</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ClientType })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="professionnel">Professionnel / Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statut</Label>
                <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v as ClientStatut })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactif">Prospect (pas encore client)</SelectItem>
                    <SelectItem value="actif">Client actif</SelectItem>
                    <SelectItem value="suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Identité */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Identité</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nom <span className="text-destructive">*</span></Label>
                  <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Prénom</Label>
                  <Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="mt-1" />
                </div>
                {form.type === "professionnel" && (
                  <div className="col-span-2">
                    <Label className="text-xs">Raison sociale / Entreprise</Label>
                    <Input value={form.raison_sociale} onChange={(e) => setForm({ ...form, raison_sociale: e.target.value })} className="mt-1" />
                  </div>
                )}
              </div>
            </div>

            {/* Coordonnées */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Coordonnées</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email <span className="text-destructive">*</span></Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Téléphone <span className="text-destructive">*</span></Label>
                  <Input type="tel" placeholder="77 000 00 00" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Téléphone secondaire</Label>
                  <Input type="tel" value={form.telephone_secondaire} onChange={(e) => setForm({ ...form, telephone_secondaire: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Région</Label>
                  <Select value={form.localisation} onValueChange={(v) => setForm({ ...form, localisation: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      {REGIONS_SENEGAL.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Adresse</Label>
                  <Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Acquisition */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Acquisition</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Canal d'acquisition</Label>
                  <Select value={form.canal_acquisition} onValueChange={(v) => setForm({ ...form, canal_acquisition: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Comment nous a-t-il connu ?" /></SelectTrigger>
                    <SelectContent>
                      {CANAUX_ACQUISITION.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {isAdmin && (
                  <div>
                    <Label className="text-xs">Commercial responsable</Label>
                    <Select value={form.commercial_id} onValueChange={(v) => setForm({ ...form, commercial_id: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Assigner un commercial..." /></SelectTrigger>
                      <SelectContent>
                        {commerciaux.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs">Notes internes</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Informations complémentaires, besoin exprimé, contexte..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? "Enregistrer les modifications" : "Créer le prospect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Page ───────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserPlus className="h-7 w-7" /> Prospects & Clients
            </h2>
            <p className="text-muted-foreground">Gestion du portefeuille client et des prospects</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouveau prospect</Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total",     value: stats.total,     color: "text-foreground" },
            { label: "Actifs",    value: stats.actifs,    color: "text-green-600" },
            { label: "Prospects", value: stats.prospects, color: "text-blue-600" },
            { label: "Suspendus", value: stats.suspendus, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "inactif", "actif", "suspendu"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statutFilter === s ? "default" : "outline"}
                onClick={() => setStatutFilter(s)}
              >
                {s === "all" ? "Tous" : s === "inactif" ? "Prospects" : STATUT_CONFIG[s].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">Aucun résultat.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client / Prospect</TableHead>
                    <TableHead>Coordonnées</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Canal</TableHead>
                    {isAdmin && <TableHead>Commercial</TableHead>}
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const cfg = STATUT_CONFIG[p.statut];
                    const Icon = cfg.icon;
                    const canal = CANAUX_ACQUISITION.find((c) => c.value === p.canal_acquisition);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium text-sm">
                            {p.prenom ? `${p.prenom} ${p.nom}` : p.nom}
                          </p>
                          {p.raison_sociale && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Building2 className="h-3 w-3" />{p.raison_sociale}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                              <a href={`mailto:${p.email}`} className="text-primary hover:underline truncate max-w-[160px]">{p.email}</a>
                            </div>
                            {p.telephone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 shrink-0" />{p.telephone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.localisation ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />{p.localisation}
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {canal?.label ?? (p.canal_acquisition ? p.canal_acquisition : "—")}
                          </span>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {p.commercial_nom || "—"}
                            </span>
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                            <Icon className="mr-1 h-3 w-3" />{cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default LeadsPage;
