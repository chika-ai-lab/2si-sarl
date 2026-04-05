import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useClient, useUpdateClient, useDeleteClient } from "../hooks/useClients";
import { useCommandes } from "../hooks/useCommandes";
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, User, Building2, Mail, Phone, MapPin, CreditCard,
  ShoppingCart, TrendingUp, Edit, Trash2, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { UpdateClientDTO, ClientStatut, ClientCategorie, BanquePartenaire } from "../types";

const STATUT_CONFIG = {
  actif:    { label: "Actif",     color: "bg-green-100 text-green-800", Icon: CheckCircle },
  inactif:  { label: "Inactif",   color: "bg-gray-100 text-gray-700",   Icon: XCircle },
  suspendu: { label: "Suspendu",  color: "bg-red-100 text-red-800",     Icon: AlertTriangle },
} as const;

const CMD_STATUT = {
  brouillon:  { label: "Brouillon",  color: "bg-gray-100 text-gray-700" },
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  validee:    { label: "Validée",    color: "bg-blue-100 text-blue-800" },
  en_cours:   { label: "En cours",   color: "bg-purple-100 text-purple-800" },
  livree:     { label: "Livrée",     color: "bg-green-100 text-green-800" },
  annulee:    { label: "Annulée",    color: "bg-red-100 text-red-800" },
} as const;

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading, isError } = useClient(id!);
  const { data: commandesData } = useCommandes({ clientId: id, limit: 50 });
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm]                 = useState<UpdateClientDTO>({});

  const commandes = commandesData?.data ?? [];

  const openEdit = () => {
    if (!client) return;
    setForm({
      nom: client.nom,
      prenom: client.prenom,
      raisonSociale: client.raisonSociale,
      email: client.email,
      telephone: client.telephone,
      telephoneSecondaire: client.telephoneSecondaire,
      adresse: { ...(client.adresse ?? {}) },
      categorie: client.categorie,
      creditLimite: credit.limite,
      banquePartenaire: client.banquePartenaire,
      numeroCompte: client.numeroCompte,
      notes: client.notes,
      statut: client.statut,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () =>
    updateClient.mutate({ id: id!, data: form }, { onSuccess: () => setIsEditOpen(false) });

  const handleDelete = () =>
    deleteClient.mutate(id!, { onSuccess: () => navigate("/admin/commercial/clients") });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  if (isError || !client)
    return (
      <div className="space-y-4">
        <Link to="/admin/commercial/clients">
          <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
        </Link>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Client introuvable.</CardContent></Card>
      </div>
    );

  const cfg = STATUT_CONFIG[client.statut] ?? STATUT_CONFIG.actif;
  const credit = client.credit ?? { limite: 0, utilise: 0, disponible: 0 };
  const creditPct = credit.limite > 0
    ? Math.min(Math.round((credit.utilise / credit.limite) * 100), 100)
    : 0;

  return (
    <>
      {/* ── Edit Dialog ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier le client</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Nom",             key: "nom" as const },
              { label: "Prénom",          key: "prenom" as const },
              { label: "Raison sociale",  key: "raisonSociale" as const },
              { label: "Email",           key: "email" as const, type: "email" },
              { label: "Téléphone",       key: "telephone" as const },
              { label: "Tél. secondaire", key: "telephoneSecondaire" as const },
              { label: "N° Compte",       key: "numeroCompte" as const },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type={type ?? "text"}
                  value={(form[key] as string) ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}

            <div>
              <Label>Limite crédit (FCFA)</Label>
              <Input
                type="number"
                value={form.creditLimite ?? ""}
                onChange={(e) => setForm({ ...form, creditLimite: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v as ClientStatut })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégorie</Label>
              <Select value={form.categorie} onValueChange={(v) => setForm({ ...form, categorie: v as ClientCategorie })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A — Premium</SelectItem>
                  <SelectItem value="B">B — Standard</SelectItem>
                  <SelectItem value="C">C — Basique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Banque</Label>
              <Select value={form.banquePartenaire} onValueChange={(v) => setForm({ ...form, banquePartenaire: v as BanquePartenaire })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBAO">CBAO</SelectItem>
                  <SelectItem value="CMS">CMS</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Adresse</Label>
              <Input
                placeholder="Rue"
                value={form.adresse?.rue ?? ""}
                onChange={(e) => setForm({ ...form, adresse: { ...form.adresse!, rue: e.target.value } })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Ville"
                  value={form.adresse?.ville ?? ""}
                  onChange={(e) => setForm({ ...form, adresse: { ...form.adresse!, ville: e.target.value } })}
                />
                <Input
                  placeholder="Pays"
                  value={form.adresse?.pays ?? ""}
                  onChange={(e) => setForm({ ...form, adresse: { ...form.adresse!, pays: e.target.value } })}
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdate} disabled={updateClient.isPending}>
              {updateClient.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données de{" "}
              <strong>{client.raisonSociale || client.nom}</strong> seront supprimées.
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/commercial/clients">
              <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">
                {client.raisonSociale || `${client.nom}${client.prenom ? " " + client.prenom : ""}`}
              </h2>
              <span className="font-mono text-sm text-muted-foreground">{client.code}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEdit}><Edit className="mr-2 h-4 w-4" />Modifier</Button>
            <Button variant="destructive" size="icon" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              icon: <ShoppingCart className="h-5 w-5 text-blue-600" />,
              bg: "bg-blue-100",
              label: "Commandes",
              value: client.nombreCommandes,
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-green-600" />,
              bg: "bg-green-100",
              label: "Total achats",
              value: formatCurrency(client.totalAchats),
            },
            {
              icon: <CreditCard className="h-5 w-5 text-purple-600" />,
              bg: "bg-purple-100",
              label: "Crédit dispo",
              value: formatCurrency(credit.disponible),
            },
            {
              icon: <cfg.Icon className="h-5 w-5 text-orange-600" />,
              bg: "bg-orange-100",
              label: "Statut",
              value: <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>,
            },
          ].map(({ icon, bg, label, value }) => (
            <Card key={label}>
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
          ))}
        </div>

        {/* Info + Credit */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {client.type === "entreprise"
                  ? <Building2 className="h-4 w-4 text-muted-foreground" />
                  : <User className="h-4 w-4 text-muted-foreground" />}
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Type" value={<Badge variant="outline">{client.type === "entreprise" ? "Entreprise" : "Particulier"}</Badge>} />
              <Row label="Catégorie" value={<Badge variant="secondary">{{ A: "A — Premium", B: "B — Standard", C: "C — Basique" }[client.categorie] ?? client.categorie}</Badge>} />
              <Row label="Banque"      value={client.banquePartenaire} />
              {client.numeroCompte && <Row label="N° Compte" value={<span className="font-mono">{client.numeroCompte}</span>} />}
              <Row label="Depuis"      value={new Date(client.dateCreation).toLocaleDateString("fr-FR")} />
              {client.dernierAchat && <Row label="Dernier achat" value={new Date(client.dernierAchat).toLocaleDateString("fr-FR")} />}
              <hr />
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.telephone}</span>
              </div>
              {client.telephoneSecondaire && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.telephoneSecondaire}</span>
                </div>
              )}
              {client.adresse && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {[client.adresse.rue, client.adresse.ville, client.adresse.codePostal, client.adresse.pays].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {client.notes && (
                <div className="bg-muted rounded p-3 mt-2">
                  <p className="font-medium text-muted-foreground mb-1">Notes</p>
                  <p>{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-muted-foreground" />Crédit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Limite"     value={<span className="font-semibold">{formatCurrency(credit.limite)}</span>} />
              <Row label="Utilisé"    value={<span className="font-semibold text-orange-600">{formatCurrency(credit.utilise)}</span>} />
              <Row label="Disponible" value={<span className="font-semibold text-green-600">{formatCurrency(credit.disponible)}</span>} />
              <div className="pt-2">
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      creditPct > 80 ? "bg-red-500" : creditPct > 50 ? "bg-orange-400" : "bg-green-500"
                    }`}
                    style={{ width: `${creditPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">{creditPct}% utilisé</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commandes */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des commandes ({commandes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {commandes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune commande.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode paiement</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commandes.map((cmd) => {
                    const cs = CMD_STATUT[cmd.statut as keyof typeof CMD_STATUT];
                    return (
                      <TableRow key={cmd.id}>
                        <TableCell className="font-mono text-sm font-medium">{cmd.reference}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(cmd.dateCommande).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-sm capitalize">{cmd.modePaiement}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(cmd.total)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cs?.color}>{cs?.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/commercial/commandes/${cmd.id}`}>
                            <Button variant="ghost" size="sm">Voir</Button>
                          </Link>
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
