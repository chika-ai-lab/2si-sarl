import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { Truck, User, Phone, Car, CalendarDays, MapPin, FileText, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { BonLivraisonPDF } from "./BonLivraisonPDF";
import { FicheExpeditionPDF } from "./FicheExpeditionPDF";
import type { BLForm, CommandeLivraison } from "../types";
import { EMPTY_BL_FORM } from "../types";
import { clientDisplayName } from "../lib/livraisons.helpers";

interface Props {
  commande:  CommandeLivraison | null;
  open:      boolean;
  onClose:   () => void;
  onPrinted: (commande: CommandeLivraison) => void;
}

export function BLDialog({ commande, open, onClose, onPrinted }: Props) {
  const [blForm,   setBlForm]   = useState<BLForm>(EMPTY_BL_FORM);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (open) setBlForm({ ...EMPTY_BL_FORM, datePlanifiee: new Date().toISOString().slice(0, 16) });
  }, [open, commande?.id]);

  const openPdf = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const handlePrintBL = async () => {
    if (!commande) return;
    setPrinting(true);
    try {
      const blob = await pdf(<BonLivraisonPDF commande={commande} blForm={blForm} />).toBlob();
      await openPdf(blob);
      onPrinted(commande);
      onClose();
    } catch {
      toast({ title: "Erreur lors de la génération du PDF", variant: "destructive" });
    } finally { setPrinting(false); }
  };

  const handlePrintFiche = async () => {
    if (!commande) return;
    try {
      const blob = await pdf(<FicheExpeditionPDF commande={commande} />).toBlob();
      await openPdf(blob);
    } catch {
      toast({ title: "Erreur lors de la génération du PDF", variant: "destructive" });
    }
  };

  const set = (key: keyof BLForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBlForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl overflow-hidden p-0 gap-0 w-[calc(100%-2rem)]">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Bon de Livraison</h2>
              <p className="text-xs text-muted-foreground font-mono">{commande?.reference}</p>
            </div>
          </div>
          {commande?.client && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{clientDisplayName(commande.client)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <MapPin className="h-3 w-3" />
                {commande.client.adresse?.ville || "Dakar"}
              </p>
            </div>
          )}
        </div>

        {/* ── Form ── */}
        <div className="px-6 py-5 space-y-4">

          {/* Chauffeur — 2 colonnes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Nom du chauffeur
              </Label>
              <Input
                value={blForm.chauffeurNom}
                onChange={set("chauffeurNom")}
                placeholder="Ex: Pape Ngom"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Téléphone
              </Label>
              <Input
                value={blForm.chauffeurTel}
                onChange={set("chauffeurTel")}
                placeholder="Ex: 76 311 29 47"
                className="h-9"
              />
            </div>
          </div>

          {/* Matricule + Date — 2 colonnes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5" /> Matricule véhicule
              </Label>
              <Input
                value={blForm.matricule}
                onChange={set("matricule")}
                placeholder="Ex: AA788BZ"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Date planifiée
              </Label>
              <Input
                type="datetime-local"
                value={blForm.datePlanifiee}
                onChange={set("datePlanifiee")}
                className="h-9"
              />
            </div>
          </div>

          {/* Client card */}
          {commande?.client && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{clientDisplayName(commande.client)}</p>
                <p className="text-xs text-muted-foreground">
                  {commande.client.adresse?.ville || "Dakar"} · {commande.client.telephone}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t px-6 py-4 flex items-center justify-end gap-2 bg-muted/20">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintFiche} disabled={printing}>
            <FileText className="h-4 w-4 mr-1.5" />Fiche d'Expédition
          </Button>
          <Button size="sm" onClick={handlePrintBL} disabled={printing}>
            {printing
              ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              : <Printer className="h-4 w-4 mr-1.5" />}
            Imprimer BL
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
