import { useState, useEffect } from "react";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Mail, Phone, Building2, Edit, Trash2, ArrowRight, Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

type LeadStatut = "nouveau" | "contacte" | "qualifie" | "proposition" | "gagne" | "perdu";
type LeadSource = "site_web" | "referral" | "appel_entrant" | "salon" | "publicite" | "autre";

interface Lead {
  id: string;
  nom: string;
  entreprise?: string;
  email: string;
  telephone?: string;
  statut: LeadStatut;
  source: LeadSource;
  valeurEstimee?: number;
  notes?: string;
  dateCreation: string;
  dateProchain?: string;
  commercialAssigne?: string;
}

const STATUT_CONFIG: Record<LeadStatut, { label: string; color: string; icon: React.ElementType }> = {
  nouveau:     { label: "Nouveau",      color: "bg-blue-100 text-blue-800",    icon: UserPlus },
  contacte:    { label: "Contacté",     color: "bg-yellow-100 text-yellow-800", icon: Clock },
  qualifie:    { label: "Qualifié",     color: "bg-orange-100 text-orange-800", icon: TrendingUp },
  proposition: { label: "Proposition",  color: "bg-purple-100 text-purple-800", icon: ArrowRight },
  gagne:       { label: "Gagné",        color: "bg-green-100 text-green-800",   icon: CheckCircle },
  perdu:       { label: "Perdu",        color: "bg-red-100 text-red-800",       icon: XCircle },
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  site_web:      "Site web",
  referral:      "Recommandation",
  appel_entrant: "Appel entrant",
  salon:         "Salon / Event",
  publicite:     "Publicité",
  autre:         "Autre",
};

const INITIAL_LEADS: Lead[] = [
  {
    id: "ld-001", nom: "Thierno Diallo", entreprise: "BTP Solutions SARL",
    email: "t.diallo@btp-solutions.sn", telephone: "+221 77 891 23 45",
    statut: "qualifie", source: "site_web", valeurEstimee: 12500000,
    notes: "Intéressé par équipements informatiques", dateCreation: "2025-01-10",
    dateProchain: "2025-02-01", commercialAssigne: "Aissatou Ndiaye"
  },
  {
    id: "ld-002", nom: "Marème Faye", entreprise: "Cabinet MF Consulting",
    email: "m.faye@mfconsulting.sn", telephone: "+221 76 012 34 56",
    statut: "proposition", source: "referral", valeurEstimee: 8000000,
    dateCreation: "2025-01-18", dateProchain: "2025-01-30", commercialAssigne: "Aissatou Ndiaye"
  },
  {
    id: "ld-003", nom: "Omar Coulibaly", entreprise: "Import Export OC",
    email: "o.coulibaly@iec.sn",
    statut: "contacte", source: "salon", valeurEstimee: 25000000,
    notes: "Rencontré au Salon SAITEX", dateCreation: "2025-01-20"
  },
  {
    id: "ld-004", nom: "Aminata Sarr",
    email: "a.sarr@gmail.com", telephone: "+221 70 456 78 90",
    statut: "nouveau", source: "appel_entrant",
    dateCreation: "2025-01-25"
  },
  {
    id: "ld-005", nom: "Serigne Mbaye", entreprise: "Groupe SM Industries",
    email: "s.mbaye@sm-industries.sn",
    statut: "gagne", source: "referral", valeurEstimee: 45000000,
    notes: "Converti en client - CMD-2025-034", dateCreation: "2024-11-15"
  },
];

const EMPTY_FORM = {
  nom: "", entreprise: "", email: "", telephone: "",
  statut: "nouveau" as LeadStatut, source: "site_web" as LeadSource,
  valeurEstimee: "", notes: "", dateProchain: "", commercialAssigne: "",
};

const PIPELINE_ORDER: LeadStatut[] = ["nouveau", "contacte", "qualifie", "proposition", "gagne", "perdu"];

export function LeadsPage() {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statutFilter, setStatutFilter] = useState<LeadStatut | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [form, setForm]       = useState(EMPTY_FORM);

  const fetchLeads = async () => {
    try {
      const res = await apiClient.get<any>('/clients');
      const items: any[] = res.data ?? res ?? [];
      const mapped: Lead[] = items.map((item: any) => {
        const statut: LeadStatut =
          item.statut === "actif"    ? "gagne"    :
          item.statut === "inactif"  ? "nouveau"  :
          item.statut === "suspendu" ? "perdu"    :
          "contacte";
        return {
          id: String(item.id),
          nom: item.nom_complet ?? `${item.prenom ?? ""} ${item.nom ?? ""}`.trim(),
          entreprise: item.raison_sociale ?? "",
          email: item.email ?? "",
          telephone: item.telephone ?? "",
          statut,
          source: "autre" as LeadSource,
          valeurEstimee: item.credit_limite ? Number(item.credit_limite) : undefined,
          notes: item.notes ?? "",
          dateCreation: item.created_at?.slice(0, 10) ?? "",
          dateProchain: undefined,
          commercialAssigne: undefined,
        };
      });
      setLeads(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.nom.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.entreprise?.toLowerCase().includes(q);
    const matchStatut = statutFilter === "all" || l.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setIsDialogOpen(true); };

  const openEdit = (lead: Lead) => {
    setEditId(lead.id);
    setForm({
      nom: lead.nom, entreprise: lead.entreprise ?? "", email: lead.email,
      telephone: lead.telephone ?? "", statut: lead.statut, source: lead.source,
      valeurEstimee: lead.valeurEstimee?.toString() ?? "", notes: lead.notes ?? "",
      dateProchain: lead.dateProchain ?? "", commercialAssigne: lead.commercialAssigne ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.email) {
      toast({ title: "Champs requis", description: "Nom et email sont obligatoires.", variant: "destructive" });
      return;
    }
    const payload = {
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      raison_sociale: form.entreprise,
      notes: form.notes,
      type: 'professionnel',
      statut: 'inactif',
    };
    const localData: Partial<Lead> = {
      nom: form.nom, entreprise: form.entreprise || undefined, email: form.email,
      telephone: form.telephone || undefined, statut: form.statut, source: form.source,
      valeurEstimee: form.valeurEstimee ? Number(form.valeurEstimee) : undefined,
      notes: form.notes || undefined, dateProchain: form.dateProchain || undefined,
      commercialAssigne: form.commercialAssigne || undefined,
    };
    try {
      if (editId) {
        await apiClient.put(`/clients/${editId}`, payload);
        setLeads((prev) => prev.map((l) => l.id === editId ? { ...l, ...localData } : l));
        toast({ title: "Prospect modifié" });
      } else {
        await apiClient.post('/clients', payload);
        await fetchLeads();
        toast({ title: "Prospect créé" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/clients/${id}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Prospect supprimé" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const pipelineStats = PIPELINE_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.statut === s).length;
    return acc;
  }, {} as Record<LeadStatut, number>);

  const totalValeur = leads
    .filter((l) => l.statut !== "perdu")
    .reduce((sum, l) => sum + (l.valeurEstimee ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le prospect" : "Nouveau prospect"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom complet *</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <Label>Entreprise</Label>
              <Input value={form.entreprise} onChange={(e) => setForm({ ...form, entreprise: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v as LeadStatut })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PIPELINE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STATUT_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as LeadSource })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valeur estimée (FCFA)</Label>
              <Input type="number" value={form.valeurEstimee} onChange={(e) => setForm({ ...form, valeurEstimee: e.target.value })} />
            </div>
            <div>
              <Label>Prochain contact</Label>
              <Input type="date" value={form.dateProchain} onChange={(e) => setForm({ ...form, dateProchain: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Commercial assigné</Label>
              <Input value={form.commercialAssigne} onChange={(e) => setForm({ ...form, commercialAssigne: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editId ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserPlus className="h-7 w-7" /> Prospects
            </h2>
            <p className="text-muted-foreground">Pipeline commercial et suivi des opportunités</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouveau prospect</Button>
        </div>

        {/* Pipeline */}
        <div className="grid gap-3 grid-cols-3 md:grid-cols-6">
          {PIPELINE_ORDER.map((s) => {
            const cfg = STATUT_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <Card key={s} className={`cursor-pointer transition-all ${statutFilter === s ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => setStatutFilter(statutFilter === s ? "all" : s)}>
                <CardContent className="pt-4 pb-4 text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  <p className="text-2xl font-bold">{pipelineStats[s]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* KPI valeur */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6 flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Valeur totale du pipeline (hors perdus)</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalValeur)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un prospect..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>{filtered.length} prospect(s)</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucun prospect trouvé.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect</TableHead>
                    <TableHead>Coordonnées</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Valeur est.</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Prochain contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => {
                    const cfg = STATUT_CONFIG[lead.statut];
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <p className="font-medium">{lead.nom}</p>
                          {lead.entreprise && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />{lead.entreprise}
                            </div>
                          )}
                          {lead.commercialAssigne && (
                            <p className="text-xs text-muted-foreground mt-0.5">→ {lead.commercialAssigne}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <a href={`mailto:${lead.email}`} className="text-primary hover:underline text-xs">{lead.email}</a>
                            </div>
                            {lead.telephone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />{lead.telephone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{SOURCE_LABELS[lead.source]}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {lead.valeurEstimee ? formatCurrency(lead.valeurEstimee) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.color}>
                            <Icon className="mr-1 h-3 w-3" />{cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.dateProchain
                            ? new Date(lead.dateProchain).toLocaleDateString("fr-FR")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(lead)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
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
