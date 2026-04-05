import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { enregistrerDevis, type Lead, type Modalite } from "../hooks/useLeads";
import { formatCfa } from "../lib/leads.constants";

interface LignePrix {
  article_id: number;
  libelle: string;
  quantite: number;
  prixUnitaire: string;
}

export function DevisDialog({ lead, open, onClose, onSaved }: {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initLignes = (): LignePrix[] =>
    (lead.articles ?? []).map((a) => ({
      article_id:   a.article_id,
      libelle:      a.article?.libelle ?? `Article #${a.article_id}`,
      quantite:     a.quantite,
      prixUnitaire: String(a.article?.prix_achat ?? ""),
    }));

  const [lignes]                       = useState<LignePrix[]>(initLignes);
  const [fraisExpedition, setFraisExp] = useState(String(lead.frais_expedition ?? ""));
  const [duree, setDuree]              = useState(String(lead.duree_paiement ?? "12"));
  const [saving, setSaving]            = useState(false);

  const TAUX_COMMISSION = 0.03;
  const totalAchat  = lignes.reduce((s, l) => s + (parseFloat(l.prixUnitaire) || 0) * l.quantite, 0);
  const base        = totalAchat + (parseFloat(fraisExpedition) || 0);
  const prixVente   = base > 0 ? Math.round(base / (1 - TAUX_COMMISSION)) : 0;
  const plansPreview: Modalite[] = prixVente > 0
    ? [6, 12, 24].map((d) => ({ duree: d, mensualite: Math.round(prixVente / d), total: prixVente }))
    : [];

  const handleSave = async () => {
    if (prixVente <= 0) { toast({ title: "Prix invalide", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await enregistrerDevis(lead.id, {
        prix_vente:        prixVente,
        frais_expedition:  parseFloat(fraisExpedition) || 0,
        autres_charges:    0,
        remise:            0,
        duree_paiement:    parseInt(duree),
        lignes: lignes.map((l) => ({
          article_id: l.article_id,
          prix_achat: parseFloat(l.prixUnitaire) || 0,
          quantite:   l.quantite,
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmer le devis — {lead.reference}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm p-3 rounded-lg bg-muted/40 border">
            <span className="text-muted-foreground">Client</span>
            <span className="font-medium">{lead.client?.nom} {lead.client?.prenom}</span>
            {lead.localisation && <>
              <span className="text-muted-foreground">Localisation</span>
              <span>{lead.localisation}</span>
            </>}
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="px-3 py-2 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Articles demandés
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {lignes.map((ligne) => (
                  <tr key={ligne.article_id}>
                    <td className="px-3 py-2">{ligne.libelle}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground w-16">×{ligne.quantite}</td>
                    <td className="px-3 py-2 text-right font-medium w-28 whitespace-nowrap">
                      {formatCfa((parseFloat(ligne.prixUnitaire) || 0) * ligne.quantite)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <Label className="text-xs">Frais d'expédition (FCFA) — si client hors Dakar</Label>
            <Input
              type="number" min="0"
              value={fraisExpedition}
              onChange={(e) => setFraisExp(e.target.value)}
              placeholder="0"
              className="mt-1 h-9 text-sm"
            />
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="font-semibold text-primary">Prix de vente client</span>
            <span className="font-bold text-xl text-primary">{formatCfa(Math.max(0, prixVente))}</span>
          </div>

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
