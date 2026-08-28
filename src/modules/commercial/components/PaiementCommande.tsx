import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Wallet, Plus, Landmark, User, Trash2, Loader2, Pencil, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  VersementsService, STATUT_PAIEMENT, LIBELLE_ORIGINE, libelleMoyen,
  type OrigineVersement, type ImputationVersement,
} from "../services/versements.service";

/**
 * Suivi et saisie des encaissements d'une commande.
 *
 * Une commande peut être financée en partie par la banque et complétée par un
 * apport client. Chaque versement porte son origine, et le commercial choisit
 * ce qu'il solde — le système propose une imputation, il ne l'impose pas.
 */
export function PaiementCommande({ commandeId }: { commandeId: number | string }) {
  const qc = useQueryClient();
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  const [repartitionOuverte, setRepartitionOuverte] = useState(false);
  const [suppression, setSuppression] = useState<number | null>(null);

  const { data: suivi, isLoading } = useQuery({
    queryKey: ["paiement", String(commandeId)],
    queryFn: () => VersementsService.suivi(commandeId),
    staleTime: 1000 * 30,
  });

  const rafraichir = () => {
    qc.invalidateQueries({ queryKey: ["paiement", String(commandeId)] });
    qc.invalidateQueries({ queryKey: ["historique", "commande_client", String(commandeId)] });
    qc.invalidateQueries({ queryKey: ["agregats"] });
  };

  const supprimer = async (id: number) => {
    setSuppression(id);
    try {
      await VersementsService.supprimer(id);
      toast({ title: "Versement annulé" });
      rafraichir();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setSuppression(null);
    }
  };

  if (isLoading || !suivi) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Paiement</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
        </CardContent>
      </Card>
    );
  }

  const statut = STATUT_PAIEMENT[suivi.statut];
  const pourcent = Math.round(suivi.progression * 100);
  const repartitionManquante = suivi.montantFinance + suivi.apportClient === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          Paiement
          <Badge variant="outline" className={cn("ml-1 text-[11px]", statut.className)}>
            {statut.label}
          </Badge>
        </CardTitle>
        <Button size="sm" onClick={() => setSaisieOuverte(true)} disabled={suivi.reliquat <= 0}>
          <Plus className="h-4 w-4 mr-1.5" />Versement
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Progression */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold tabular-nums">
              {formatCurrency(suivi.encaisse)}
              <span className="text-muted-foreground font-normal"> encaissés sur {formatCurrency(suivi.montant)}</span>
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{pourcent} %</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden" role="presentation">
            <div
              className={cn("h-full rounded-full transition-all",
                suivi.statut === "paye" ? "bg-emerald-600" : "bg-primary")}
              style={{ width: `${pourcent}%` }}
            />
          </div>
          {suivi.reliquat > 0 && (
            <p className="text-xs text-muted-foreground">
              Reliquat : <span className="font-semibold text-foreground tabular-nums">
                {formatCurrency(suivi.reliquat)}
              </span>
            </p>
          )}
        </div>

        {/* Répartition */}
        <div className="grid sm:grid-cols-2 gap-3">
          <PartFinancement
            icone={<Landmark className="h-3.5 w-3.5" />}
            titre="Financement bancaire"
            prevu={suivi.montantFinance}
            encaisse={suivi.encaisseFinancement}
            reste={suivi.resteFinancement}
          />
          <PartFinancement
            icone={<User className="h-3.5 w-3.5" />}
            titre="Apport client"
            prevu={suivi.apportClient}
            encaisse={suivi.encaisseApport}
            reste={suivi.resteApport}
          />
        </div>

        {repartitionManquante && (
          <p className="text-xs text-amber-700 dark:text-amber-400 inline-flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 mt-px shrink-0" />
            Aucune répartition définie : tout est réputé financé par la banque.
          </p>
        )}
        <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs"
          onClick={() => setRepartitionOuverte(true)}>
          <Pencil className="h-3 w-3 mr-1.5" />Modifier la répartition
        </Button>

        {/* Versements */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Versements ({suivi.versements.length})
          </p>
          {suivi.versements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun encaissement enregistré.
            </p>
          ) : (
            <ul className="divide-y border rounded-lg">
              {suivi.versements.map((v) => (
                <li key={v.id} className="flex items-start gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold tabular-nums">{formatCurrency(Number(v.montant))}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {LIBELLE_ORIGINE[v.origine]}
                      </Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">{v.dateVersement}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {Number(v.imputeApport) > 0 && `Apport ${formatCurrency(Number(v.imputeApport))}`}
                      {Number(v.imputeApport) > 0 && Number(v.imputeFinancement) > 0 && " · "}
                      {Number(v.imputeFinancement) > 0 && `Financement ${formatCurrency(Number(v.imputeFinancement))}`}
                      {v.modePaiement && ` · ${libelleMoyen(v.modePaiement)}`}
                      {v.reference && ` · réf. ${v.reference}`}
                    </p>
                    {v.note && <p className="text-xs text-muted-foreground mt-0.5">{v.note}</p>}
                    {v.userNom && <p className="text-[11px] text-muted-foreground mt-0.5">{v.userNom}</p>}
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                    aria-label="Annuler ce versement"
                    disabled={suppression === v.id}
                    onClick={() => supprimer(v.id)}
                  >
                    {suppression === v.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5 text-destructive" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <SaisieVersement
        open={saisieOuverte}
        onClose={() => setSaisieOuverte(false)}
        commandeId={Number(commandeId)}
        reliquat={suivi.reliquat}
        resteApport={suivi.resteApport}
        resteFinancement={suivi.resteFinancement}
        onEnregistre={rafraichir}
      />

      <RepartitionFinancement
        open={repartitionOuverte}
        onClose={() => setRepartitionOuverte(false)}
        commandeId={commandeId}
        montant={suivi.montant}
        montantFinance={suivi.montantFinance}
        apportClient={suivi.apportClient}
        onEnregistre={rafraichir}
      />
    </Card>
  );
}

function PartFinancement({
  icone, titre, prevu, encaisse, reste,
}: {
  icone: React.ReactNode; titre: string;
  prevu: number; encaisse: number; reste: number;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1.5">
        {icone}{titre}
      </p>
      <p className="text-sm font-semibold tabular-nums mt-1">{formatCurrency(prevu)}</p>
      <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
        {formatCurrency(encaisse)} encaissé
        {reste > 0 && ` · reste ${formatCurrency(reste)}`}
      </p>
    </div>
  );
}

// ─── Saisie d'un versement ───────────────────────────────────────────────────

function SaisieVersement({
  open, onClose, commandeId, reliquat, resteApport, resteFinancement, onEnregistre,
}: {
  open: boolean; onClose: () => void; commandeId: number;
  reliquat: number; resteApport: number; resteFinancement: number;
  onEnregistre: () => void;
}) {
  const [montant, setMontant]       = useState("");
  const [origine, setOrigine]       = useState<OrigineVersement>("client");
  const [imputation, setImputation] = useState<ImputationVersement>("auto");
  const [moyen, setMoyen]           = useState("");
  const [reference, setReference]   = useState("");
  const [date, setDate]             = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote]             = useState("");
  const [envoi, setEnvoi]           = useState(false);

  const { data: moyens = [] } = useQuery({
    queryKey: ["moyens-paiement"],
    queryFn: () => VersementsService.moyensPaiement(),
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!open) return;
    setMontant(""); setOrigine("client"); setImputation("auto");
    setMoyen(moyens[0] ?? ""); setReference(""); setNote("");
    setDate(new Date().toISOString().slice(0, 10));
  }, [open, moyens]);

  // Aperçu de la ventilation, calculé comme le fera le serveur.
  const apercu = useMemo(() => {
    const m = Number(montant);
    if (!(m > 0)) return null;
    if (imputation === "apport") {
      const p = Math.min(m, resteApport);
      return { apport: p, financement: 0, excedent: m - p };
    }
    if (imputation === "financement") {
      const p = Math.min(m, resteFinancement);
      return { apport: 0, financement: p, excedent: m - p };
    }
    const premier = origine === "client" ? "apport" : "financement";
    const dispo = { apport: resteApport, financement: resteFinancement };
    const ordre = dispo[premier] > 0
      ? [premier, premier === "apport" ? "financement" : "apport"]
      : ["apport", "financement"];
    let restant = m;
    const pris = { apport: 0, financement: 0 } as Record<string, number>;
    for (const part of ordre) {
      const p = Math.min(restant, dispo[part as "apport" | "financement"]);
      pris[part] = p;
      restant -= p;
    }
    return { apport: pris.apport, financement: pris.financement, excedent: restant };
  }, [montant, origine, imputation, resteApport, resteFinancement]);

  const valide = Number(montant) > 0;

  const enregistrer = async () => {
    setEnvoi(true);
    try {
      const res = await VersementsService.creer({
        commande_client_id: commandeId,
        montant: Number(montant),
        origine,
        imputation,
        mode_paiement: moyen || undefined,
        reference: reference.trim() || undefined,
        date_versement: date,
        note: note.trim() || undefined,
      });
      toast({
        title: "Versement enregistré",
        description: res.excedent > 0
          ? `${formatCurrency(res.excedent)} n'ont pas pu être imputés : la commande est soldée.`
          : undefined,
      });
      onEnregistre();
      onClose();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !envoi && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enregistrer un versement</DialogTitle>
          <DialogDescription>
            Reste à encaisser : <strong>{formatCurrency(reliquat)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-montant">Montant (FCFA) <span className="text-destructive">*</span></Label>
              <Input id="v-montant" type="number" min="1" value={montant}
                onChange={(e) => setMontant(e.target.value)} placeholder="20000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-date">Date</Label>
              <Input id="v-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Origine des fonds</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["client", "banque"] as OrigineVersement[]).map((o) => (
                <Button key={o} type="button" variant={origine === o ? "default" : "outline"}
                  onClick={() => setOrigine(o)} className="justify-start">
                  {o === "client" ? <User className="h-4 w-4 mr-2" /> : <Landmark className="h-4 w-4 mr-2" />}
                  {LIBELLE_ORIGINE[o]}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="v-imputation">Imputation</Label>
            <Select value={imputation} onValueChange={(v) => setImputation(v as ImputationVersement)}>
              <SelectTrigger id="v-imputation"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatique</SelectItem>
                <SelectItem value="apport">Forcer sur l'apport client</SelectItem>
                <SelectItem value="financement">Forcer sur le financement bancaire</SelectItem>
              </SelectContent>
            </Select>
            {apercu && (
              <p className="text-xs text-muted-foreground">
                {apercu.apport > 0 && `Apport ${formatCurrency(apercu.apport)}`}
                {apercu.apport > 0 && apercu.financement > 0 && " · "}
                {apercu.financement > 0 && `Financement ${formatCurrency(apercu.financement)}`}
                {apercu.excedent > 0 && (
                  <span className="text-amber-700 dark:text-amber-400">
                    {(apercu.apport > 0 || apercu.financement > 0) && " · "}
                    {formatCurrency(apercu.excedent)} non imputés
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-moyen">Moyen de paiement</Label>
              <Select value={moyen} onValueChange={setMoyen}>
                <SelectTrigger id="v-moyen"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  {moyens.map((m) => (
                    <SelectItem key={m} value={m}>{libelleMoyen(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-ref">Référence</Label>
              <Input id="v-ref" value={reference} onChange={(e) => setReference(e.target.value)}
                placeholder="N° de transfert" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="v-note">Observation</Label>
            <Textarea id="v-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={envoi}>Annuler</Button>
          <Button disabled={!valide || envoi} onClick={enregistrer}>
            {envoi && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Enregistrer le versement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Répartition du financement ──────────────────────────────────────────────

function RepartitionFinancement({
  open, onClose, commandeId, montant, montantFinance, apportClient, onEnregistre,
}: {
  open: boolean; onClose: () => void; commandeId: number | string;
  montant: number; montantFinance: number; apportClient: number;
  onEnregistre: () => void;
}) {
  const [banque, setBanque] = useState("");
  const [envoi, setEnvoi]   = useState(false);

  useEffect(() => {
    if (open) setBanque(String(montantFinance || montant));
  }, [open, montantFinance, montant]);

  // L'apport se déduit : deux champs libres laisseraient la somme diverger.
  const apport = Math.max(0, montant - (Number(banque) || 0));
  const valide = Number(banque) >= 0 && Number(banque) <= montant;

  const enregistrer = async () => {
    setEnvoi(true);
    try {
      await VersementsService.definirFinancement(commandeId, Number(banque), apport);
      toast({ title: "Répartition enregistrée" });
      onEnregistre();
      onClose();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message, variant: "destructive" });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !envoi && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Répartition du financement</DialogTitle>
          <DialogDescription>
            Montant de la commande : <strong>{formatCurrency(montant)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="r-banque">Financé par la banque (FCFA)</Label>
            <Input id="r-banque" type="number" min="0" max={montant} value={banque}
              onChange={(e) => setBanque(e.target.value)} />
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Apport client, déduit</p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(apport)}</p>
          </div>
          {!valide && (
            <p className="text-xs text-destructive">
              La part bancaire doit être comprise entre 0 et {formatCurrency(montant)}.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={envoi}>Annuler</Button>
          <Button disabled={!valide || envoi} onClick={enregistrer}>
            {envoi && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaiementCommande;
