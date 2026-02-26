import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCommande, useChangeCommandeStatut, useDeleteCommande } from "../hooks/useCommandes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
  ArrowLeft, Package, User, MapPin, CreditCard, FileText, Truck,
  CheckCircle, XCircle, Clock, AlertCircle, Trash2, RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { CommandeStatut } from "../types";

const STATUT_CONFIG: Record<CommandeStatut, { label: string; color: string; icon: React.ElementType }> = {
  brouillon:  { label: "Brouillon",  color: "bg-gray-100 text-gray-700",     icon: FileText },
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800",  icon: Clock },
  validee:    { label: "Validée",    color: "bg-blue-100 text-blue-800",      icon: CheckCircle },
  en_cours:   { label: "En cours",   color: "bg-purple-100 text-purple-800",  icon: RefreshCw },
  livree:     { label: "Livrée",     color: "bg-green-100 text-green-800",    icon: Truck },
  annulee:    { label: "Annulée",    color: "bg-red-100 text-red-800",        icon: XCircle },
};

const PAIEMENT_STATUT: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  partiel:    { label: "Partiel",    color: "bg-orange-100 text-orange-800" },
  complet:    { label: "Payé",       color: "bg-green-100 text-green-800" },
};

const TRANSITIONS: Record<CommandeStatut, CommandeStatut[]> = {
  brouillon:  ["en_attente", "annulee"],
  en_attente: ["validee", "annulee"],
  validee:    ["en_cours", "annulee"],
  en_cours:   ["livree", "annulee"],
  livree:     [],
  annulee:    [],
};

export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: commande, isLoading, isError } = useCommande(id!);
  const changeStatut  = useChangeCommandeStatut();
  const deleteCommande = useDeleteCommande();

  const [isStatutOpen,  setIsStatutOpen]  = useState(false);
  const [isDeleteOpen,  setIsDeleteOpen]  = useState(false);
  const [newStatut,     setNewStatut]     = useState<CommandeStatut | "">("");

  const handleStatutChange = () => {
    if (!newStatut || !id) return;
    changeStatut.mutate(
      { id, statut: newStatut },
      { onSuccess: () => setIsStatutOpen(false) }
    );
  };

  const handleDelete = () =>
    deleteCommande.mutate(id!, { onSuccess: () => navigate("/admin/commercial/commandes") });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  if (isError || !commande)
    return (
      <div className="space-y-4">
        <Link to="/admin/commercial/commandes">
          <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
        </Link>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Commande introuvable.</CardContent></Card>
      </div>
    );

  const statutCfg     = STATUT_CONFIG[commande.statut];
  const paiementCfg   = PAIEMENT_STATUT[commande.statutPaiement] ?? PAIEMENT_STATUT.en_attente;
  const StatusIcon    = statutCfg.icon;
  const nextStatuts   = TRANSITIONS[commande.statut];
  const resteAPayer   = commande.total - commande.montantPaye;

  return (
    <>
      {/* ── Statut Dialog ── */}
      <Dialog open={isStatutOpen} onOpenChange={setIsStatutOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Changer le statut</DialogTitle></DialogHeader>
          <Select value={newStatut} onValueChange={(v) => setNewStatut(v as CommandeStatut)}>
            <SelectTrigger><SelectValue placeholder="Choisir un statut" /></SelectTrigger>
            <SelectContent>
              {nextStatuts.map((s) => (
                <SelectItem key={s} value={s}>{STATUT_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatutOpen(false)}>Annuler</Button>
            <Button onClick={handleStatutChange} disabled={!newStatut || changeStatut.isPending}>
              {changeStatut.isPending ? "Mise à jour..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La commande <strong>{commande.reference}</strong> sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Page ── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link to="/admin/commercial/commandes">
              <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold font-mono">{commande.reference}</h2>
                <Badge variant="outline" className={statutCfg.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statutCfg.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(commande.dateCommande).toLocaleDateString("fr-FR", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {nextStatuts.length > 0 && (
              <Button onClick={() => setIsStatutOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />Changer statut
              </Button>
            )}
            {commande.statut === "brouillon" && (
              <Button variant="destructive" size="icon" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            icon={<Package className="h-5 w-5 text-blue-600" />}
            bg="bg-blue-100"
            label="Sous-total"
            value={formatCurrency(commande.sousTotal)}
          />
          <KpiCard
            icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
            bg="bg-orange-100"
            label="Taxe (18%)"
            value={formatCurrency(commande.taxe)}
          />
          <KpiCard
            icon={<CreditCard className="h-5 w-5 text-green-600" />}
            bg="bg-green-100"
            label="Total"
            value={<span className="text-green-700">{formatCurrency(commande.total)}</span>}
          />
          <KpiCard
            icon={<Clock className="h-5 w-5 text-red-500" />}
            bg="bg-red-100"
            label="Reste à payer"
            value={<span className={resteAPayer > 0 ? "text-red-600" : "text-green-600"}>{formatCurrency(resteAPayer)}</span>}
          />
        </div>

        {/* Client + Livraison + Paiement */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Client */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4 text-muted-foreground" />Client</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {commande.client ? (
                <>
                  <p className="font-semibold">{commande.client.raisonSociale || commande.client.nom}</p>
                  <p className="text-muted-foreground">{commande.client.email}</p>
                  <p className="text-muted-foreground">{commande.client.telephone}</p>
                  <Link to={`/admin/commercial/clients/${commande.clientId}`}>
                    <Button variant="outline" size="sm" className="mt-2 w-full">Voir la fiche client</Button>
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground">ID: <span className="font-mono">{commande.clientId}</span></p>
              )}
            </CardContent>
          </Card>

          {/* Livraison */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Truck className="h-4 w-4 text-muted-foreground" />Livraison</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Mode" value={commande.modeLivraison.replace(/_/g, " ")} />
              {commande.fraisLivraison > 0 && <Row label="Frais" value={formatCurrency(commande.fraisLivraison)} />}
              {commande.dateLivraison && (
                <Row label="Date" value={new Date(commande.dateLivraison).toLocaleDateString("fr-FR")} />
              )}
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  {commande.adresseLivraison.rue}, {commande.adresseLivraison.ville},{" "}
                  {commande.adresseLivraison.pays}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-muted-foreground" />Paiement</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Mode" value={<span className="capitalize">{commande.modePaiement}</span>} />
              <Row
                label="Statut"
                value={<Badge variant="outline" className={paiementCfg.color}>{paiementCfg.label}</Badge>}
              />
              <Row label="Payé"     value={<span className="text-green-600 font-semibold">{formatCurrency(commande.montantPaye)}</span>} />
              <Row label="Restant"  value={<span className={resteAPayer > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>{formatCurrency(resteAPayer)}</span>} />
              {commande.accreditif && <Row label="Accréditif" value={<span className="font-mono text-xs">{commande.accreditif}</span>} />}
            </CardContent>
          </Card>
        </div>

        {/* Lignes de commande */}
        <Card>
          <CardHeader>
            <CardTitle>Articles commandés ({commande.lignes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Remise</TableHead>
                  <TableHead className="text-right">Sous-total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commande.lignes.map((ligne) => (
                  <TableRow key={ligne.id}>
                    <TableCell>
                      <p className="font-medium">{ligne.produit?.nom ?? ligne.produitId}</p>
                      {ligne.produit?.reference && (
                        <p className="text-xs text-muted-foreground font-mono">{ligne.produit.reference}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{ligne.quantite}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ligne.prixUnitaire)}</TableCell>
                    <TableCell className="text-right">
                      {ligne.remise > 0 ? (
                        <span className="text-orange-600">-{ligne.remise}%</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(ligne.sousTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totaux */}
            <div className="mt-4 flex justify-end">
              <div className="w-72 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatCurrency(commande.sousTotal)}</span>
                </div>
                {commande.remise > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Remise</span>
                    <span>-{formatCurrency(commande.remise)}</span>
                  </div>
                )}
                {commande.fraisLivraison > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span>{formatCurrency(commande.fraisLivraison)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA (18%)</span>
                  <span>{formatCurrency(commande.taxe)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(commande.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {commande.notes && (
          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{commande.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function KpiCard({ icon, bg, label, value }: { icon: React.ReactNode; bg: string; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
