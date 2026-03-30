import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  MapPin, CreditCard, CheckCircle, Loader2, RefreshCw,
  Globe, UserCheck, ClipboardList, Search, ChevronDown, ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  useTicketsOuverts, useMesTickets,
  autoAssignerLead, enregistrerDevis, confirmerLead,
  type Lead, type Modalite,
} from "../hooks/useLeads";

// ── Helpers ────────────────────────────────────────────────────────────────

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
  bouche_a_oreille: "Bouche à oreille",
  google: "Google",
  facebook: "Facebook/Instagram",
  linkedin: "LinkedIn",
  recommandation: "Recommandation",
  autre: "Autre",
};

function formatCfa(n: number) {
  return new Intl.NumberFormat("fr-SN", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " FCFA";
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Ligne expandable ────────────────────────────────────────────────────────

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
      <TableRow
        className="cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Référence */}
        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {lead.reference}
        </TableCell>

        {/* Client */}
        <TableCell>
          <p className="font-medium text-sm leading-tight">
            {lead.client?.nom} {lead.client?.prenom}
          </p>
          <p className="text-xs text-muted-foreground">{lead.client?.telephone}</p>
        </TableCell>

        {/* Localisation */}
        <TableCell>
          {lead.localisation ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> {lead.localisation}
            </span>
          ) : <span className="text-xs text-muted-foreground">—</span>}
        </TableCell>

        {/* Source / canal */}
        <TableCell>
          {lead.source === "marketplace" ? (
            <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
              <Globe className="h-3 w-3" /> Web
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs w-fit">Commercial</Badge>
          )}
          {lead.canal_acquisition && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {LABEL_CANAL[lead.canal_acquisition] ?? lead.canal_acquisition}
            </p>
          )}
        </TableCell>

        {/* Articles */}
        <TableCell className="text-center text-sm">
          {lead.articles?.length ?? 0}
        </TableCell>

        {/* Devis */}
        <TableCell>
          {lead.prix_vente ? (
            <span className="text-xs font-semibold text-green-700">{formatCfa(lead.prix_vente)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">En attente</span>
          )}
        </TableCell>

        {/* Statut */}
        <TableCell>
          <Badge className={`text-xs border ${BADGE_TICKET[lead.etat_ticket]}`}>
            {LABEL_TICKET[lead.etat_ticket]}
          </Badge>
        </TableCell>

        {/* Date */}
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(lead.created_at)}
        </TableCell>

        {/* Actions */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            {lead.etat_ticket === "ouvert" && (
              <Button size="sm" className="h-7 text-xs px-2" onClick={handleAutoAssign} disabled={busy}>
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3 mr-1" />}
                Prendre
              </Button>
            )}
            {(lead.etat_ticket === "assigne" || lead.etat_ticket === "en_cours") && (
              <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setDevisOpen(true)}>
                <CreditCard className="h-3 w-3 mr-1" />
                {lead.prix_vente ? "Modifier" : "Devis"}
              </Button>
            )}
            {lead.etat === "devis_envoye" && (
              <Button size="sm" className="h-7 text-xs px-2" onClick={handleConfirmer} disabled={busy}>
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                Confirmer
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Ligne de détail expandable */}
      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={9} className="py-3 px-6">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {/* Articles */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Articles</p>
                {lead.articles && lead.articles.length > 0 ? (
                  <ul className="space-y-0.5">
                    {lead.articles.map((a) => (
                      <li key={a.id} className="text-xs">
                        • {a.article?.libelle ?? `Article #${a.article_id}`} — qté {a.quantite}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-muted-foreground">Aucun article</p>}
              </div>

              {/* Devis détail */}
              {lead.prix_vente && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Devis</p>
                  <p className="text-xs">Prix de vente : <span className="font-semibold">{formatCfa(lead.prix_vente)}</span></p>
                  {lead.frais_expedition ? <p className="text-xs">Expédition : {formatCfa(lead.frais_expedition)}</p> : null}
                  {lead.duree_paiement ? (
                    <p className="text-xs">
                      Plan : {lead.duree_paiement} mois · {formatCfa(Math.round(lead.prix_vente / lead.duree_paiement))}/mois
                    </p>
                  ) : null}
                  {lead.devis_envoye_at ? (
                    <p className="text-xs text-muted-foreground">Envoyé le {formatDate(lead.devis_envoye_at)}</p>
                  ) : null}
                </div>
              )}

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Contact</p>
                {lead.client?.email && <p className="text-xs">{lead.client.email}</p>}
                {lead.client?.telephone && <p className="text-xs">{lead.client.telephone}</p>}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      <DevisDialog
        lead={lead}
        open={devisOpen}
        onClose={() => setDevisOpen(false)}
        onSaved={() => { setDevisOpen(false); onAction(); }}
      />
    </>
  );
}

// ── Dialog devis ───────────────────────────────────────────────────────────

interface LignePrix {
  article_id: number;
  libelle: string;
  quantite: number;
  prixUnitaire: string; // prix achat unitaire
}

function DevisDialog({ lead, open, onClose, onSaved }: {
  lead: Lead; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const initLignes = () => (lead.articles ?? []).map((a) => ({
    article_id:   a.article_id,
    libelle:      a.article?.libelle ?? `Article #${a.article_id}`,
    quantite:     a.quantite,
    prixUnitaire: String(a.article?.prix_achat ?? ""),
  }));

  const initMarge = () => {
    if (!lead.prix_vente) return "";
    const totalAchat = (lead.articles ?? []).reduce(
      (s, a) => s + (a.article?.prix_achat ?? 0) * a.quantite, 0
    );
    const m = lead.prix_vente
      - totalAchat
      - (lead.frais_expedition ?? 0)
      - (lead.autres_charges ?? 0);
    return m > 0 ? String(Math.round(m)) : "";
  };

  const [lignes, setLignes] = useState<LignePrix[]>(initLignes);
  const [fraisExpedition, setFraisExpedition] = useState(String(lead.frais_expedition ?? ""));
  const [autresCharges,   setAutresCharges]   = useState(String(lead.autres_charges ?? ""));
  const [remise,          setRemise]          = useState("0");
  const [marge,           setMarge]           = useState(initMarge);
  const [duree,           setDuree]           = useState(String(lead.duree_paiement ?? "12"));

  // Resync quand le dialog se rouvre avec un lead différent
  useEffect(() => {
    if (open) {
      setLignes(initLignes());
      setFraisExpedition(String(lead.frais_expedition ?? ""));
      setAutresCharges(String(lead.autres_charges ?? ""));
      setDuree(String(lead.duree_paiement ?? "12"));
      setMarge(initMarge());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead.id]);
  const [saving,          setSaving]          = useState(false);

  const TAUX_COMMISSION = 0.03; // taux minimum backend

  const totalAchat = lignes.reduce(
    (sum, l) => sum + (parseFloat(l.prixUnitaire) || 0) * l.quantite, 0
  );

  // prix_vente = (coûts + marge_nette) / (1 - taux_commission)
  // Garantit que marge_nette = prix_vente - prix_achat - frais - commission
  const base =
    totalAchat +
    (parseFloat(fraisExpedition) || 0) +
    (parseFloat(autresCharges) || 0) -
    (parseFloat(remise) || 0) +
    (parseFloat(marge) || 0);
  const prixVente = base > 0 ? Math.round(base / (1 - TAUX_COMMISSION)) : 0;
  const commissionEstimee = Math.round(prixVente * TAUX_COMMISSION);

  const plansPreview: Modalite[] = prixVente > 0
    ? [6, 12, 24].map((d) => ({ duree: d, mensualite: Math.round(prixVente / d), total: prixVente }))
    : [];

  const updateLigne = (idx: number, val: string) => {
    setLignes((prev) => prev.map((l, i) => i === idx ? { ...l, prixUnitaire: val } : l));
  };

  const handleSave = async () => {
    if (prixVente <= 0) { toast({ title: "Prix invalide", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await enregistrerDevis(lead.id, {
        prix_vente:       prixVente,
        frais_expedition: parseFloat(fraisExpedition) || 0,
        autres_charges:   parseFloat(autresCharges)   || 0,
        remise:           parseFloat(remise)           || 0,
        duree_paiement:   parseInt(duree),
        lignes: lignes.map((l) => ({
          article_id: l.article_id,
          prix_achat:  parseFloat(l.prixUnitaire) || 0,
          quantite:    l.quantite,
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Devis — {lead.reference}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Résumé client */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Client</span>
            <span className="font-medium">{lead.client?.nom} {lead.client?.prenom}</span>
            <span className="text-muted-foreground">Localisation</span>
            <span>{lead.localisation ?? "—"}</span>
          </div>

          {/* Lignes articles avec prix d'achat */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prix d'achat par article
            </p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Article</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground w-12">Qté</th>
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
                          type="number"
                          value={ligne.prixUnitaire}
                          onChange={(e) => updateLigne(idx, e.target.value)}
                          className="h-7 text-xs text-right"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-medium">
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
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Frais & ajustements</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Frais expédition (FCFA)</Label>
                <Input type="number" value={fraisExpedition} onChange={(e) => setFraisExpedition(e.target.value)} placeholder="0" className="h-8 text-sm" />
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

          {/* Récapitulatif */}
          <div className="rounded-lg border divide-y text-sm">
            <div className="flex justify-between px-4 py-2 text-muted-foreground">
              <span>Total achats</span><span>{formatCfa(totalAchat)}</span>
            </div>
            {parseFloat(fraisExpedition) > 0 && (
              <div className="flex justify-between px-4 py-2 text-muted-foreground">
                <span>Frais expédition</span><span>+ {formatCfa(parseFloat(fraisExpedition))}</span>
              </div>
            )}
            {parseFloat(autresCharges) > 0 && (
              <div className="flex justify-between px-4 py-2 text-muted-foreground">
                <span>Autres charges</span><span>+ {formatCfa(parseFloat(autresCharges))}</span>
              </div>
            )}
            {parseFloat(remise) > 0 && (
              <div className="flex justify-between px-4 py-2 text-green-700">
                <span>Remise</span><span>− {formatCfa(parseFloat(remise))}</span>
              </div>
            )}
            {parseFloat(marge) > 0 && (
              <div className="flex justify-between px-4 py-2 text-muted-foreground">
                <span>Marge nette souhaitée</span><span>+ {formatCfa(parseFloat(marge))}</span>
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
                  <button
                    key={plan.duree}
                    type="button"
                    onClick={() => setDuree(String(plan.duree))}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      duree === String(plan.duree)
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
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

// ── Table leads ────────────────────────────────────────────────────────────

function LeadsTable({
  leads, loading, emptyIcon: EmptyIcon, emptyText, onAction,
}: {
  leads: Lead[];
  loading: boolean;
  emptyIcon: React.ElementType;
  emptyText: string;
  onAction: () => void;
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
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
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
              {filtered.map((lead) => (
                <LeadRow key={lead.id} lead={lead} onAction={onAction} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          {search && ` sur ${leads.length}`}
        </p>
      )}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────

export default function LeadsPage() {
  const { leads: ouverts,  loading: l1, reload: r1 } = useTicketsOuverts();
  const { leads: mesLeads, loading: l2, reload: r2 } = useMesTickets();

  const reload = () => { r1(); r2(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads & Tickets</h1>
          <p className="text-muted-foreground text-sm">Gestion des demandes clients</p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
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
        </TabsList>

        <TabsContent value="ouverts" className="mt-4">
          <LeadsTable
            leads={ouverts}
            loading={l1}
            emptyIcon={ClipboardList}
            emptyText="Aucun ticket ouvert dans votre zone."
            onAction={reload}
          />
        </TabsContent>

        <TabsContent value="mes-tickets" className="mt-4">
          <LeadsTable
            leads={mesLeads}
            loading={l2}
            emptyIcon={CheckCircle}
            emptyText="Aucun ticket assigné pour le moment."
            onAction={reload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
