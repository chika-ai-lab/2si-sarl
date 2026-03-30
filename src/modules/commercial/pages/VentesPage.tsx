import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin, CreditCard, CheckCircle, Loader2, RefreshCw, Globe, UserCheck,
  ClipboardList, Search, ChevronDown, ChevronUp, ShoppingCart, Plus, Trash2,
  Package, Clock, FileText, Eye, MoreVertical, XCircle, Edit, TrendingUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { FactureDialog } from "../components/FactureDialog";
import {
  useTicketsOuverts, useMesTickets,
  autoAssignerLead, enregistrerDevis, confirmerLead,
  type Lead, type Modalite,
} from "../hooks/useLeads";
import { useCommandes } from "../hooks/useCommandes";
import { useClients } from "../hooks/useClients";
import { apiClient } from "../services/apiClient";
import { createCommande, deleteCommande, changeCommandeStatut } from "../services/commandes.service";
import type { CommandeCommerciale, CommandeStatut, ModePaiement } from "../types";

// ── Helpers communs ────────────────────────────────────────────────────────

function formatCfa(n: number) {
  return new Intl.NumberFormat("fr-SN", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " FCFA";
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Helpers leads ──────────────────────────────────────────────────────────

const BADGE_TICKET: Record<string, string> = {
  ouvert:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigne:  "bg-blue-100 text-blue-800 border-blue-200",
  en_cours: "bg-purple-100 text-purple-800 border-purple-200",
  ferme:    "bg-green-100 text-green-800 border-green-200",
};
const LABEL_TICKET: Record<string, string> = {
  ouvert: "Ouvert", assigne: "Assigné", en_cours: "En cours", ferme: "Fermé",
};
const LABEL_CANAL: Record<string, string> = {
  bouche_a_oreille: "Bouche à oreille", google: "Google",
  facebook: "Facebook/Instagram", linkedin: "LinkedIn",
  recommandation: "Recommandation", autre: "Autre",
};

// ── Helpers commandes ──────────────────────────────────────────────────────

interface LigneForm {
  article_id: string; quantite: number; prix_achat: number;
  frais_livraison_fournisseur: number; frais_livraison_client: number;
  type_livraison: "agence" | "destination"; taux_commission: number; marge: number;
}
const EMPTY_LIGNE: LigneForm = {
  article_id: "", quantite: 1, prix_achat: 0,
  frais_livraison_fournisseur: 0, frais_livraison_client: 0,
  type_livraison: "agence", taux_commission: 0.05, marge: 0,
};
function calcLigne(l: LigneForm) {
  const base = l.prix_achat + l.frais_livraison_fournisseur + l.frais_livraison_client + l.marge;
  const prix = l.taux_commission < 1 ? base / (1 - l.taux_commission) : base;
  const commission = prix * l.taux_commission;
  const cTotal = l.prix_achat + l.frais_livraison_fournisseur + l.frais_livraison_client + commission;
  return { prix, commission, cTotal };
}

const STATUT_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  brouillon:  { label: "Brouillon",  color: "bg-gray-100 text-gray-800",    icon: Edit },
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  validee:    { label: "Validée",    color: "bg-blue-100 text-blue-800",    icon: CheckCircle },
  en_cours:   { label: "En cours",   color: "bg-purple-100 text-purple-800", icon: Package },
  livree:     { label: "Livrée",     color: "bg-green-100 text-green-800",  icon: CheckCircle },
  annulee:    { label: "Annulée",    color: "bg-red-100 text-red-800",      icon: XCircle },
};
const PAIEMENT_CONFIG: Record<string, { label: string; color: string }> = {
  en_attente:         { label: "Non payé",           color: "bg-red-100 text-red-800" },
  partiellement_paye: { label: "Partiellement payé", color: "bg-orange-100 text-orange-800" },
  paye:               { label: "Payé",               color: "bg-green-100 text-green-800" },
  // rétrocompat anciennes valeurs
  partiel:            { label: "Partiellement payé", color: "bg-orange-100 text-orange-800" },
  complet:            { label: "Payé",               color: "bg-green-100 text-green-800" },
};

// ── DevisDialog ────────────────────────────────────────────────────────────

interface LignePrix { article_id: number; libelle: string; quantite: number; prixUnitaire: string; }

function DevisDialog({ lead, open, onClose, onSaved }: {
  lead: Lead; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const initLignes = () => (lead.articles ?? []).map((a) => ({
    article_id: a.article_id,
    libelle: a.article?.libelle ?? `Article #${a.article_id}`,
    quantite: a.quantite,
    prixUnitaire: String(a.article?.prix_achat ?? ""),
  }));
  const initMarge = () => {
    if (!lead.prix_vente) return "";
    const totalAchat = (lead.articles ?? []).reduce((s, a) => s + (a.article?.prix_achat ?? 0) * a.quantite, 0);
    const m = lead.prix_vente - totalAchat - (lead.frais_expedition ?? 0) - (lead.autres_charges ?? 0);
    return m > 0 ? String(Math.round(m)) : "";
  };

  const [lignes, setLignes]               = useState<LignePrix[]>(initLignes);
  const [fraisExpedition, setFraisExp]    = useState(String(lead.frais_expedition ?? ""));
  const [autresCharges, setAutresCharges] = useState(String(lead.autres_charges ?? ""));
  const [remise, setRemise]               = useState("0");
  const [marge, setMarge]                 = useState(initMarge);
  const [duree, setDuree]                 = useState(String(lead.duree_paiement ?? "12"));
  const [saving, setSaving]               = useState(false);

  useEffect(() => {
    if (open) {
      setLignes(initLignes());
      setFraisExp(String(lead.frais_expedition ?? ""));
      setAutresCharges(String(lead.autres_charges ?? ""));
      setDuree(String(lead.duree_paiement ?? "12"));
      setMarge(initMarge());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead.id]);

  const TAUX_COMMISSION = 0.03;
  const totalAchat = lignes.reduce((sum, l) => sum + (parseFloat(l.prixUnitaire) || 0) * l.quantite, 0);
  const base = totalAchat + (parseFloat(fraisExpedition) || 0) + (parseFloat(autresCharges) || 0)
    - (parseFloat(remise) || 0) + (parseFloat(marge) || 0);
  const prixVente = base > 0 ? Math.round(base / (1 - TAUX_COMMISSION)) : 0;
  const commissionEstimee = Math.round(prixVente * TAUX_COMMISSION);
  const plansPreview: Modalite[] = prixVente > 0
    ? [6, 12, 24].map((d) => ({ duree: d, mensualite: Math.round(prixVente / d), total: prixVente }))
    : [];

  const updateLigne = (idx: number, val: string) =>
    setLignes((prev) => prev.map((l, i) => i === idx ? { ...l, prixUnitaire: val } : l));

  const handleSave = async () => {
    if (prixVente <= 0) { toast({ title: "Prix invalide", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await enregistrerDevis(lead.id, {
        prix_vente: prixVente,
        frais_expedition: parseFloat(fraisExpedition) || 0,
        autres_charges: parseFloat(autresCharges) || 0,
        remise: parseFloat(remise) || 0,
        duree_paiement: parseInt(duree),
        lignes: lignes.map((l) => ({
          article_id: l.article_id,
          prix_achat: parseFloat(l.prixUnitaire) || 0,
          quantite: l.quantite,
        })),
      });
      toast({ title: "Devis enregistré !" });
      onSaved();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Devis — {lead.reference}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Infos client */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm p-3 rounded-lg bg-muted/40 border">
            <span className="text-muted-foreground">Client</span>
            <span className="font-medium">{lead.client?.nom} {lead.client?.prenom}</span>
            {lead.localisation && <>
              <span className="text-muted-foreground">Localisation</span>
              <span>{lead.localisation}</span>
            </>}
          </div>

          {/* Prix d'achat par article */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Prix d'achat par article</p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Article</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground w-16">Qté</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground w-36">Prix achat unitaire</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground w-28">Sous-total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lignes.map((ligne, idx) => (
                    <tr key={ligne.article_id}>
                      <td className="px-3 py-2 text-xs">{ligne.libelle}</td>
                      <td className="px-3 py-2 text-center text-xs">{ligne.quantite}</td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number" min="0" value={ligne.prixUnitaire}
                          onChange={(e) => updateLigne(idx, e.target.value)}
                          className="h-7 text-xs text-right w-full"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-medium whitespace-nowrap">
                        {formatCfa((parseFloat(ligne.prixUnitaire) || 0) * ligne.quantite)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/20">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-right">Total achats</td>
                    <td className="px-3 py-2 text-right text-xs font-bold">{formatCfa(totalAchat)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Frais & ajustements */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Frais &amp; ajustements</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Frais expédition (FCFA)</Label>
                <Input type="number" value={fraisExpedition} onChange={(e) => setFraisExp(e.target.value)} placeholder="0" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Autres charges</Label>
                <Input type="number" value={autresCharges} onChange={(e) => setAutresCharges(e.target.value)} placeholder="0" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Remise accordée</Label>
                <Input type="number" value={remise} onChange={(e) => setRemise(e.target.value)} placeholder="0" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Marge commerciale</Label>
                <Input type="number" value={marge} onChange={(e) => setMarge(e.target.value)} placeholder="0" className="h-8 text-sm" />
              </div>
            </div>
          </div>

          {/* Récap prix de vente */}
          <div className="rounded-lg border divide-y text-sm">
            <div className="flex justify-between px-4 py-2 text-muted-foreground">
              <span>Total achats</span><span>{formatCfa(totalAchat)}</span>
            </div>
            {(parseFloat(fraisExpedition) || 0) > 0 && (
              <div className="flex justify-between px-4 py-2 text-muted-foreground">
                <span>Frais expédition</span><span>+ {formatCfa(parseFloat(fraisExpedition) || 0)}</span>
              </div>
            )}
            {(parseFloat(autresCharges) || 0) > 0 && (
              <div className="flex justify-between px-4 py-2 text-muted-foreground">
                <span>Autres charges</span><span>+ {formatCfa(parseFloat(autresCharges) || 0)}</span>
              </div>
            )}
            {(parseFloat(remise) || 0) > 0 && (
              <div className="flex justify-between px-4 py-2 text-orange-600">
                <span>Remise</span><span>- {formatCfa(parseFloat(remise) || 0)}</span>
              </div>
            )}
            {(parseFloat(marge) || 0) > 0 && (
              <div className="flex justify-between px-4 py-2 text-muted-foreground">
                <span>Marge nette souhaitée</span><span>+ {formatCfa(parseFloat(marge) || 0)}</span>
              </div>
            )}
            {commissionEstimee > 0 && (
              <div className="flex justify-between px-4 py-2 text-orange-600 text-xs">
                <span>Commission estimée ({(TAUX_COMMISSION * 100).toFixed(0)}%)</span>
                <span>+ {formatCfa(commissionEstimee)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-2.5 bg-primary/5 font-bold">
              <span className="text-primary">Prix de vente</span>
              <span className="text-primary text-lg">{formatCfa(Math.max(0, prixVente))}</span>
            </div>
          </div>

          {/* Plans de paiement */}
          {plansPreview.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan de paiement</p>
              <div className="grid grid-cols-3 gap-2">
                {plansPreview.map((plan) => (
                  <button key={plan.duree} type="button" onClick={() => setDuree(String(plan.duree))}
                    className={`p-3 rounded-lg border text-center transition-all ${duree === String(plan.duree)
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-primary/50"}`}>
                    <p className="font-bold text-sm">{plan.duree} mois</p>
                    <p className="text-xs text-muted-foreground">{formatCfa(plan.mensualite)}/mois</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || prixVente <= 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
            Enregistrer le devis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── LeadRow ────────────────────────────────────────────────────────────────

function LeadRow({ lead, onAction }: { lead: Lead; onAction: () => void }) {
  const [expanded, setExpanded]   = useState(false);
  const [busy, setBusy]           = useState(false);
  const [devisOpen, setDevisOpen] = useState(false);

  const handleAutoAssign = async () => {
    setBusy(true);
    try {
      await autoAssignerLead(lead.id);
      toast({ title: "Ticket pris en charge !" });
      onAction();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally { setBusy(false); }
  };
  const handleConfirmer = async () => {
    setBusy(true);
    try {
      await confirmerLead(lead.id);
      toast({ title: "Commande confirmée !" });
      onAction();
    } catch (e: unknown) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded((v) => !v)}>
        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{lead.reference}</TableCell>
        <TableCell>
          <p className="font-medium text-sm leading-tight">{lead.client?.nom} {lead.client?.prenom}</p>
          <p className="text-xs text-muted-foreground">{lead.client?.telephone}</p>
        </TableCell>
        <TableCell>
          {lead.localisation
            ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{lead.localisation}</span>
            : <span className="text-xs text-muted-foreground">—</span>}
        </TableCell>
        <TableCell>
          {lead.source === "marketplace"
            ? <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit"><Globe className="h-3 w-3" />Web</Badge>
            : <Badge variant="outline" className="text-xs w-fit">Commercial</Badge>}
          {lead.canal_acquisition && (
            <p className="text-xs text-muted-foreground mt-0.5">{LABEL_CANAL[lead.canal_acquisition] ?? lead.canal_acquisition}</p>
          )}
        </TableCell>
        <TableCell className="text-center text-sm">{lead.articles?.length ?? 0}</TableCell>
        <TableCell>
          {lead.prix_vente
            ? <span className="text-xs font-semibold text-green-700">{formatCfa(lead.prix_vente)}</span>
            : <span className="text-xs text-muted-foreground">En attente</span>}
        </TableCell>
        <TableCell>
          <Badge className={`text-xs border ${BADGE_TICKET[lead.etat_ticket]}`}>{LABEL_TICKET[lead.etat_ticket]}</Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(lead.created_at)}</TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            {lead.etat_ticket === "ouvert" && (
              <Button size="sm" className="h-7 text-xs px-2" onClick={handleAutoAssign} disabled={busy}>
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3 mr-1" />}Prendre
              </Button>
            )}
            {(lead.etat_ticket === "assigne" || lead.etat_ticket === "en_cours") && (
              <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setDevisOpen(true)}>
                <CreditCard className="h-3 w-3 mr-1" />{lead.prix_vente ? "Modifier" : "Devis"}
              </Button>
            )}
            {lead.etat === "devis_envoye" && (
              <Button size="sm" className="h-7 text-xs px-2" onClick={handleConfirmer} disabled={busy}>
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}Confirmer
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={9} className="py-3 px-6">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Articles</p>
                {lead.articles && lead.articles.length > 0 ? (
                  <ul className="space-y-0.5">
                    {lead.articles.map((a) => (
                      <li key={a.id} className="text-xs">• {a.article?.libelle ?? `Article #${a.article_id}`} — qté {a.quantite}</li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-muted-foreground">Aucun article</p>}
              </div>
              {lead.prix_vente && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Devis</p>
                  <p className="text-xs">Prix de vente : <span className="font-semibold">{formatCfa(lead.prix_vente)}</span></p>
                  {lead.frais_expedition ? <p className="text-xs">Expédition : {formatCfa(lead.frais_expedition)}</p> : null}
                  {lead.duree_paiement ? (
                    <p className="text-xs">Plan : {lead.duree_paiement} mois · {formatCfa(Math.round(lead.prix_vente / lead.duree_paiement))}/mois</p>
                  ) : null}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Contact</p>
                {lead.client?.email && <p className="text-xs">{lead.client.email}</p>}
                {lead.client?.telephone && <p className="text-xs">{lead.client.telephone}</p>}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      <DevisDialog lead={lead} open={devisOpen} onClose={() => setDevisOpen(false)} onSaved={() => { setDevisOpen(false); onAction(); }} />
    </>
  );
}

// ── LeadsTable ─────────────────────────────────────────────────────────────

function LeadsTable({ leads, loading, emptyIcon: EmptyIcon, emptyText, onAction }: {
  leads: Lead[]; loading: boolean; emptyIcon: React.ElementType; emptyText: string; onAction: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter((l) =>
      l.reference.toLowerCase().includes(q) ||
      l.client?.nom?.toLowerCase().includes(q) ||
      l.client?.prenom?.toLowerCase().includes(q) ||
      l.client?.telephone?.includes(q) ||
      l.localisation?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  if (loading) {
    return (
      <div className="space-y-2 p-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="h-4 w-20" />
            <div className="flex-1 space-y-1"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div>
            <Skeleton className="h-6 w-16" /><Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <EmptyIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{search ? "Aucun résultat pour cette recherche." : emptyText}</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs w-28">Référence</TableHead>
                <TableHead className="text-xs">Client</TableHead>
                <TableHead className="text-xs">Localisation</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs text-center w-16">Articles</TableHead>
                <TableHead className="text-xs">Devis</TableHead>
                <TableHead className="text-xs">Statut</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => <LeadRow key={lead.id} lead={lead} onAction={onAction} />)}
            </TableBody>
          </Table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}{search && ` sur ${leads.length}`}
        </p>
      )}
    </div>
  );
}

// ── CommandeDetailDialog ───────────────────────────────────────────────────

const PAIEMENT_STATUTS = [
  { value: "en_attente",        label: "En attente",          color: "bg-yellow-100 text-yellow-800" },
  { value: "partiellement_paye", label: "Partiellement payé", color: "bg-blue-100 text-blue-800" },
  { value: "paye",              label: "Payé",                color: "bg-green-100 text-green-800" },
];

function CommandeDetailDialog({ commande, clients, onClose, onFacture, onPaiementSaved }: {
  commande: CommandeCommerciale | null; clients: any[]; onClose: () => void;
  onFacture?: () => void; onPaiementSaved?: () => void;
}) {
  const [statutPaiement, setStatutPaiement] = useState(commande?.statutPaiement ?? "en_attente");
  const [montantRecu, setMontantRecu]       = useState(String(commande?.montantPaye ?? 0));
  const [savingPaiement, setSavingPaiement] = useState(false);

  useEffect(() => {
    setStatutPaiement(commande?.statutPaiement ?? "en_attente");
    setMontantRecu(String(commande?.montantPaye ?? 0));
  }, [commande?.id]);

  const handleSavePaiement = async () => {
    if (!commande) return;
    setSavingPaiement(true);
    try {
      await apiClient.patch(`/leads/${commande.id}/paiement`, {
        statut_paiement: statutPaiement,
        recu: Number(montantRecu) || 0,
      });
      toast({ title: "Paiement mis à jour" });
      onPaiementSaved?.();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSavingPaiement(false);
    }
  };

  if (!commande) return null;
  const getClientName = (id: string) => clients.find((c) => c.id === id)?.nom ?? id;
  const cfg = STATUT_CONFIG[commande.statut] ?? STATUT_CONFIG.brouillon;
  const paieCfg = PAIEMENT_STATUTS.find((p) => p.value === statutPaiement) ?? PAIEMENT_STATUTS[0];
  return (
    <Dialog open={!!commande} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-5 border-b rounded-t-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Commande</p>
              <h2 className="text-2xl font-bold tracking-tight">{commande.reference}</h2>
              <p className="text-sm text-muted-foreground mt-1">{commande.dateCommande}</p>
            </div>
            <Badge className={`text-sm px-3 py-1 ${cfg.color}`}>{cfg.label}</Badge>
          </div>
        </div>
        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Client</p>
              <p className="font-semibold">{getClientName(commande.clientId)}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Mode de paiement</p>
              <p className="font-semibold capitalize">{commande.modePaiement}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Articles</p>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Article</TableHead>
                    <TableHead className="text-center w-14">Qté</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Prix vente</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Prix achat</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Commission</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Marge</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commande.lignes.map((ligne) => (
                    <TableRow key={ligne.id}>
                      <TableCell className="font-medium">{ligne.produit?.nom || ligne.produitId}</TableCell>
                      <TableCell className="text-center">{ligne.quantite}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(ligne.prixUnitaire)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(ligne.prixAchat)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap text-blue-600">{formatCurrency(ligne.commission)}</TableCell>
                      <TableCell className={`text-right whitespace-nowrap font-semibold ${ligne.marge >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(ligne.marge)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={ligne.statut === "livré" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {ligne.statut === "livré" ? "Livré" : "En attente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="rounded-lg border bg-muted/30 p-4 min-w-[280px] space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span>{formatCurrency(commande.total)}</span></div>
              {commande.remise > 0 && (
                <div className="flex justify-between text-orange-600"><span>Remise</span><span>-{formatCurrency(commande.remise)}</span></div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total TTC</span><span>{formatCurrency(commande.total)}</span></div>
            </div>
          </div>
          {commande.notes && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm">{commande.notes}</p>
            </div>
          )}

          {/* ── Section paiement éditable ── */}
          <div className="rounded-lg border p-4 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Suivi du paiement</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Statut paiement</Label>
                <Select value={statutPaiement} onValueChange={setStatutPaiement}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAIEMENT_STATUTS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Montant encaissé (FCFA)</Label>
                <Input
                  type="number"
                  min={0}
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Statut actuel :</span>
                <Badge variant="outline" className={paieCfg.color}>{paieCfg.label}</Badge>
              </div>
              <Button size="sm" onClick={handleSavePaiement} disabled={savingPaiement}>
                {savingPaiement ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          {(commande.statut === "validee" || commande.statut === "livree") && (
            <Button variant="outline" onClick={onFacture}>
              <FileText className="mr-2 h-4 w-4" />Générer facture
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────

export default function VentesPage() {
  // ── Leads ──
  const { leads: ouverts,  loading: l1, reload: r1 } = useTicketsOuverts();
  const { leads: mesLeads, loading: l2, reload: r2 } = useMesTickets();
  const reloadLeads = () => { r1(); r2(); };

  // ── Commandes ──
  const [searchQuery, setSearchQuery]   = useState("");
  const [statutFilter, setStatutFilter] = useState<CommandeStatut | "all">("all");
  const [page, setPage]                 = useState(1);
  const limit = 10;

  const [selectedCommande, setSelectedCommande]     = useState<CommandeCommerciale | null>(null);
  const [isCreateOpen, setIsCreateOpen]             = useState(false);
  const [deleteId, setDeleteId]                     = useState<string | null>(null);
  const [saving, setSaving]                         = useState(false);
  const [factureCommande, setFactureCommande]       = useState<CommandeCommerciale | null>(null);

  const [articles, setArticles] = useState<any[]>([]);
  useEffect(() => {
    apiClient.get<any>("/articles").then((r) => setArticles(r.data ?? r ?? [])).catch(() => {});
  }, []);

  const [formClientId, setFormClientId]         = useState("");
  const [formDate, setFormDate]                 = useState(new Date().toISOString().split("T")[0]);
  const [formModePaiement, setFormModePaiement] = useState<ModePaiement>("virement");
  const [formNotes, setFormNotes]               = useState("");
  const [lignes, setLignes]                     = useState<LigneForm[]>([{ ...EMPTY_LIGNE }]);

  const resetForm = () => {
    setFormClientId(""); setFormDate(new Date().toISOString().split("T")[0]);
    setFormModePaiement("virement"); setFormNotes(""); setLignes([{ ...EMPTY_LIGNE }]);
  };

  const { data, isLoading, error, refetch } = useCommandes({
    page, limit,
    search: searchQuery || undefined,
    statut: statutFilter !== "all" ? statutFilter : undefined,
    sortBy: "dateCommande", sortOrder: "desc",
  });
  const { data: clientsData } = useClients({ limit: 1000 });
  const clients   = clientsData?.data || [];
  const commandes = data?.data || [];
  const pagination = data?.pagination;
  const getClientName = (id: string) => clients.find((c) => c.id === id)?.nom ?? id;

  const updateLigne = (i: number, field: keyof LigneForm, value: any) => {
    setLignes((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === "article_id") {
        const art = articles.find((a) => String(a.id) === value);
        if (art) next[i].prix_achat = art.prix_achat ?? 0;
      }
      return next;
    });
  };

  const handleCreate = async () => {
    if (!formClientId) { toast({ title: "Sélectionnez un client", variant: "destructive" }); return; }
    if (lignes.some((l) => !l.article_id)) { toast({ title: "Sélectionnez un article pour chaque ligne", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await createCommande({
        clientId: formClientId,
        lignes: lignes.map((l) => {
          const { prix } = calcLigne(l);
          return {
            produitId: l.article_id, quantite: l.quantite, prixUnitaire: Math.round(prix),
            prixAchat: l.prix_achat, fraisLivraisonFournisseur: l.frais_livraison_fournisseur,
            fraisLivraisonClient: l.frais_livraison_client, typeLivraison: l.type_livraison,
            tauxCommission: l.taux_commission, remise: 0,
          };
        }),
        modeLivraison: "retrait", modePaiement: formModePaiement,
        fraisLivraison: 0, remise: 0, notes: formNotes || undefined,
      });
      toast({ title: "Commande créée avec succès" });
      setIsCreateOpen(false); resetForm(); refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCommande(id);
      toast({ title: "Commande supprimée" });
      setDeleteId(null); refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleStatut = async (id: string, statut: CommandeStatut) => {
    try {
      await changeCommandeStatut(id, statut);
      toast({ title: "Statut mis à jour" }); refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      {/* Dialogs commandes */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create commande dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(o) => { setIsCreateOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>Nouvelle commande</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client *</Label>
                <Select value={formClientId} onValueChange={setFormClientId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input className="mt-1" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div>
                <Label>Mode de paiement</Label>
                <Select value={formModePaiement} onValueChange={(v) => setFormModePaiement(v as ModePaiement)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="credit">Crédit</SelectItem>
                    <SelectItem value="accreditif">Accréditif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={1} placeholder="Remarques..." />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Articles commandés</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setLignes((p) => [...p, { ...EMPTY_LIGNE }])}>
                  <Plus className="h-4 w-4 mr-1" />Ajouter article
                </Button>
              </div>
              <div className="space-y-4">
                {lignes.map((ligne, i) => {
                  const { prix, commission, cTotal } = calcLigne(ligne);
                  return (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Ligne {i + 1}</span>
                        {lignes.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setLignes((p) => p.filter((_, j) => j !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <Label className="text-xs font-medium">Article *</Label>
                          <Select value={ligne.article_id} onValueChange={(v) => updateLigne(i, "article_id", v)}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un article..." /></SelectTrigger>
                            <SelectContent>
                              {articles.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.libelle}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Quantité</Label>
                          <Input className="mt-1" type="number" min="1" value={ligne.quantite} onChange={(e) => updateLigne(i, "quantite", Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Prix d'achat (FCFA)</Label>
                          <Input className="mt-1" type="number" min="0" value={ligne.prix_achat} onChange={(e) => updateLigne(i, "prix_achat", Number(e.target.value))} />
                        </div>
                        <div>
                          <Label className="text-xs">Frais livr. fournisseur</Label>
                          <Input className="mt-1" type="number" min="0" value={ligne.frais_livraison_fournisseur} onChange={(e) => updateLigne(i, "frais_livraison_fournisseur", Number(e.target.value))} />
                        </div>
                        <div>
                          <Label className="text-xs">Frais livr. client</Label>
                          <Input className="mt-1" type="number" min="0" value={ligne.frais_livraison_client} onChange={(e) => updateLigne(i, "frais_livraison_client", Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Marge souhaitée (FCFA)</Label>
                          <Input className="mt-1" type="number" min="0" value={ligne.marge} onChange={(e) => updateLigne(i, "marge", Number(e.target.value))} />
                        </div>
                        <div>
                          <Label className="text-xs">Taux de commission</Label>
                          <Select value={String(ligne.taux_commission)} onValueChange={(v) => updateLigne(i, "taux_commission", Number(v))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.03">3%</SelectItem>
                              <SelectItem value="0.04">4%</SelectItem>
                              <SelectItem value="0.05">5%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Type de livraison</Label>
                          <Select value={ligne.type_livraison} onValueChange={(v) => updateLigne(i, "type_livraison", v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agence">En agence</SelectItem>
                              <SelectItem value="destination">À destination</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Commission ({Math.round(ligne.taux_commission * 100)}%)</p>
                          <p className="font-semibold text-blue-600 mt-1">{formatCurrency(Math.round(commission))}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Coût total</p>
                          <p className="font-semibold mt-1">{formatCurrency(Math.round(cTotal))}</p>
                        </div>
                        <div className="text-center bg-primary/10 rounded-md p-2">
                          <p className="text-xs font-semibold text-primary">Prix de vente</p>
                          <p className="font-bold text-lg text-primary mt-1">{formatCurrency(Math.round(prix))}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 border rounded-lg bg-muted/50 text-sm space-y-1">
                {(() => {
                  const totalVente = lignes.reduce((s, l) => s + Math.round(calcLigne(l).prix) * l.quantite, 0);
                  const totalComm  = lignes.reduce((s, l) => s + calcLigne(l).commission * l.quantite, 0);
                  const totalMarge = lignes.reduce((s, l) => s + l.marge * l.quantite, 0);
                  return (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">CA total</span><span className="font-semibold">{formatCurrency(totalVente)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Commissions totales</span><span className="font-semibold">{formatCurrency(totalComm)}</span></div>
                      <div className="flex justify-between font-semibold border-t pt-1"><span>Marge totale</span><span className={totalMarge >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(totalMarge)}</span></div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer la commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CommandeDetailDialog
        commande={selectedCommande}
        clients={clients}
        onClose={() => setSelectedCommande(null)}
        onFacture={() => { setFactureCommande(selectedCommande); setSelectedCommande(null); }}
        onPaiementSaved={() => refetch()}
      />

      {factureCommande && (
        <FactureDialog
          commandeId={Number(factureCommande.id)}
          commandeRef={factureCommande.reference}
          open={!!factureCommande}
          onClose={() => setFactureCommande(null)}
        />
      )}

      {/* ── Page ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes Ventes</h1>
            <p className="text-muted-foreground text-sm">Leads, devis et suivi des commandes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reloadLeads}>
              <RefreshCw className="h-4 w-4 mr-2" />Actualiser
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Nouvelle commande
            </Button>
          </div>
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
            <TabsTrigger value="commandes">Commandes</TabsTrigger>
          </TabsList>

          {/* ── File d'attente ── */}
          <TabsContent value="ouverts" className="mt-4">
            <LeadsTable leads={ouverts} loading={l1} emptyIcon={ClipboardList}
              emptyText="Aucun ticket ouvert dans votre zone." onAction={reloadLeads} />
          </TabsContent>

          {/* ── Mes tickets ── */}
          <TabsContent value="mes-tickets" className="mt-4">
            <LeadsTable leads={mesLeads} loading={l2} emptyIcon={CheckCircle}
              emptyText="Aucun ticket assigné pour le moment." onAction={reloadLeads} />
          </TabsContent>

          {/* ── Commandes ── */}
          <TabsContent value="commandes" className="mt-4 space-y-4">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Total", value: pagination?.total || 0, icon: ShoppingCart, color: "text-muted-foreground" },
                { label: "En attente", value: commandes.filter((c) => c.statut === "en_attente").length, icon: Clock, color: "text-yellow-600" },
                { label: "En cours", value: commandes.filter((c) => c.statut === "en_cours" || c.statut === "validee").length, icon: Package, color: "text-purple-600" },
                { label: "Livrées", value: commandes.filter((c) => c.statut === "livree").length, icon: CheckCircle, color: "text-green-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
                </Card>
              ))}
            </div>

            {/* Recherche + filtre */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par référence, client..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v as CommandeStatut | "all")}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="livree">Livrée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="divide-y border rounded-lg">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="flex-1 space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
                    <Skeleton className="h-6 w-20 hidden md:block" />
                    <Skeleton className="h-4 w-24 hidden md:block" />
                    <Skeleton className="h-6 w-16" /><Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center py-8 text-destructive">Erreur lors du chargement</p>
            ) : commandes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucune commande</p>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Référence</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Mode paiement</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commandes.map((commande) => {
                      const cfg = STATUT_CONFIG[commande.statut] ?? STATUT_CONFIG.brouillon;
                      const StatusIcon = cfg.icon;
                      const paieCfg = PAIEMENT_CONFIG[commande.statutPaiement] ?? PAIEMENT_CONFIG.en_attente;
                      return (
                        <TableRow key={commande.id}>
                          <TableCell className="font-mono text-sm font-medium">{commande.reference}</TableCell>
                          <TableCell>
                            <div className="font-medium">{getClientName(commande.clientId)}</div>
                            <div className="text-xs text-muted-foreground">{commande.lignes.length} article(s)</div>
                          </TableCell>
                          <TableCell className="text-sm">{commande.dateCommande}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{commande.modePaiement}</Badge></TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(commande.total)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cfg.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />{cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell><Badge variant="outline" className={paieCfg.color}>{paieCfg.label}</Badge></TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedCommande(commande)}>
                                  <Eye className="mr-2 h-4 w-4" />Voir détails
                                </DropdownMenuItem>
                                {commande.statut === "brouillon" && (
                                  <DropdownMenuItem onClick={() => handleStatut(commande.id, "validee")}>
                                    <CheckCircle className="mr-2 h-4 w-4" />Valider
                                  </DropdownMenuItem>
                                )}
                                {commande.statut === "validee" && (
                                  <DropdownMenuItem onClick={() => handleStatut(commande.id, "livree")}>
                                    <Package className="mr-2 h-4 w-4" />Marquer livrée
                                  </DropdownMenuItem>
                                )}
                                {(commande.statut === "validee" || commande.statut === "livree") && (
                                  <DropdownMenuItem onClick={() => setFactureCommande(commande)}>
                                    <FileText className="mr-2 h-4 w-4" />Générer facture
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(commande.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Page {pagination.page} sur {pagination.totalPages}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Précédent</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>Suivant</Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
