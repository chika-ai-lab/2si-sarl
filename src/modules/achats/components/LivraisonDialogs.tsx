import { useEffect, useState } from "react";
import { Loader2, Truck, PackageCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MODES_PAIEMENT } from "@/modules/commercial/lib/commandes.constants";
import type { ExpedierPayload, LivrerPayload } from "../services/bordereaux.service";

/**
 * Les trois boîtes de dialogue du parcours de livraison.
 *
 * Chacune n'a qu'une action principale, toujours en bas à droite, dont le
 * libellé nomme le résultat. Les données saisies sont envoyées au serveur
 * AVANT toute impression : le formulaire chauffeur ne produisait auparavant
 * qu'un PDF, et rien n'était enregistré.
 */

interface BaseProps {
  open: boolean;
  onClose: () => void;
  reference: string;
  client: string;
  busy?: boolean;
}

// ── Expédition ───────────────────────────────────────────────────────────────

export function ExpedierDialog({
  open, onClose, reference, client, busy,
  onConfirm,
}: BaseProps & { onConfirm: (payload: ExpedierPayload) => void }) {
  const [nom, setNom]     = useState("");
  const [tel, setTel]     = useState("");
  const [plaque, setPlaque] = useState("");
  const [note, setNote]   = useState("");

  useEffect(() => {
    if (open) { setNom(""); setTel(""); setPlaque(""); setNote(""); }
  }, [open]);

  const valide = nom.trim().length > 0 && tel.trim().length >= 9;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Expédier
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono">{reference}</span> — {client}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp-nom">Chauffeur <span className="text-destructive">*</span></Label>
              <Input id="exp-nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Pape Ngom" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-tel">Téléphone <span className="text-destructive">*</span></Label>
              <Input id="exp-tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="76 311 29 47" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-plaque">Matricule du véhicule</Label>
            <Input id="exp-plaque" value={plaque} onChange={(e) => setPlaque(e.target.value)} placeholder="AA 788 BZ" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-note">Consigne au chauffeur</Label>
            <Textarea id="exp-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Appeler le client avant d'arriver…" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button
            disabled={!valide || busy}
            onClick={() => onConfirm({
              livreur_nom: nom.trim(),
              livreur_telephone: tel.trim(),
              vehicule_matricule: plaque.trim() || undefined,
              note: note.trim() || undefined,
            })}
          >
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Truck className="h-4 w-4 mr-1.5" />}
            Expédier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Livraison ────────────────────────────────────────────────────────────────

export function LivrerDialog({
  open, onClose, reference, client, busy,
  onConfirm,
}: BaseProps & { onConfirm: (payload: LivrerPayload) => void }) {
  const [recuPar, setRecuPar] = useState("");
  const [regle, setRegle]     = useState(false);
  const [mode, setMode]       = useState("especes");
  const [note, setNote]       = useState("");

  useEffect(() => {
    if (open) { setRecuPar(""); setRegle(false); setMode("especes"); setNote(""); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary" /> Confirmer la livraison
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono">{reference}</span> — {client}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="liv-recu">Reçu par <span className="text-destructive">*</span></Label>
            <Input id="liv-recu" value={recuPar} onChange={(e) => setRecuPar(e.target.value)}
              placeholder="Nom de la personne qui a réceptionné" />
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={regle}
              onChange={(e) => setRegle(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span className="text-sm">
              Le client a réglé à la livraison
              <span className="block text-xs text-muted-foreground">
                Solde la commande et la facture. À ne cocher que si l'argent a été encaissé.
              </span>
            </span>
          </label>

          {regle && (
            <div className="space-y-1.5">
              <Label>Mode de règlement</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODES_PAIEMENT.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="liv-note">Observation</Label>
            <Textarea id="liv-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button
            disabled={!recuPar.trim() || busy}
            onClick={() => onConfirm({
              recu_par: recuPar.trim(),
              mode_paiement: regle ? mode : undefined,
              note: note.trim() || undefined,
            })}
          >
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <PackageCheck className="h-4 w-4 mr-1.5" />}
            Confirmer la livraison
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Échec / annulation ───────────────────────────────────────────────────────

const MOTIFS_ECHEC = [
  "Client absent",
  "Adresse incorrecte",
  "Client injoignable",
  "Livraison refusée",
  "Véhicule en panne",
];

export function MotifDialog({
  open, onClose, reference, client, busy,
  variante, onConfirm,
}: BaseProps & {
  variante: "echec" | "annule";
  onConfirm: (motif: string) => void;
}) {
  const [motif, setMotif] = useState("");

  useEffect(() => { if (open) setMotif(""); }, [open, variante]);

  const estEchec = variante === "echec";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${estEchec ? "text-amber-600" : "text-destructive"}`} />
            {estEchec ? "Signaler un échec" : "Annuler le bordereau"}
          </DialogTitle>
          <DialogDescription>
            <span className="font-mono">{reference}</span> — {client}
            <span className="block mt-1">
              {estEchec
                ? "Le bordereau revient dans « À expédier » et pourra repartir."
                : "Les commandes concernées repartent en approvisionnement."}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {estEchec && (
            <div className="flex flex-wrap gap-2">
              {MOTIFS_ECHEC.map((m) => (
                <Button key={m} type="button" size="sm"
                  variant={motif === m ? "default" : "outline"}
                  onClick={() => setMotif(m)}>
                  {m}
                </Button>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="motif">Motif <span className="text-destructive">*</span></Label>
            <Textarea id="motif" value={motif} onChange={(e) => setMotif(e.target.value)} rows={3}
              placeholder={estEchec ? "Précisez ce qui s'est passé…" : "Pourquoi ce bordereau est-il abandonné ?"} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Retour</Button>
          <Button
            variant={estEchec ? "default" : "destructive"}
            disabled={motif.trim().length < 3 || busy}
            onClick={() => onConfirm(motif.trim())}
          >
            {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            {estEchec ? "Signaler l'échec" : "Annuler le bordereau"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
