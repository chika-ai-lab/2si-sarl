import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Building2,
  User,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from "../hooks/useClients";
import type {
  Client,
  ClientStatut,
  ClientCategorie,
  BanquePartenaire,
  CreateClientDTO,
  UpdateClientDTO,
} from "../types";

// ─── Valeurs par défaut pour un nouveau client ───────────────────────────────
const EMPTY_FORM: CreateClientDTO = {
  nom: "",
  prenom: "",
  type: "particulier",
  email: "",
  telephone: "",
  adresse: { rue: "", ville: "Dakar", codePostal: "", pays: "Sénégal" },
  categorie: "B",
  creditLimite: 0,
  banquePartenaire: "Autre",
};

// ─── Formulaire partagé Créer / Modifier ─────────────────────────────────────
function ClientForm({
  form,
  setForm,
}: {
  form: CreateClientDTO | UpdateClientDTO;
  setForm: (f: any) => void;
}) {
  const fields: { label: string; key: string; type?: string }[] = [
    { label: "Nom", key: "nom" },
    { label: "Prénom", key: "prenom" },
    { label: "Raison sociale", key: "raisonSociale" },
    { label: "Email", key: "email", type: "email" },
    { label: "Téléphone", key: "telephone" },
    { label: "Tél. secondaire", key: "telephoneSecondaire" },
    { label: "N° Compte", key: "numeroCompte" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Type */}
      <div>
        <Label>Type</Label>
        <Select
          value={(form as any).type ?? "particulier"}
          onValueChange={(v) => setForm({ ...form, type: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="particulier">Particulier</SelectItem>
            <SelectItem value="entreprise">Entreprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Champs texte */}
      {fields.map(({ label, key, type }) => (
        <div key={key}>
          <Label>{label}</Label>
          <Input
            type={type ?? "text"}
            value={(form as any)[key] ?? ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}

      {/* Limite crédit */}
      <div>
        <Label>Limite crédit (FCFA)</Label>
        <Input
          type="number"
          value={(form as any).creditLimite ?? ""}
          onChange={(e) =>
            setForm({ ...form, creditLimite: Number(e.target.value) })
          }
        />
      </div>

      {/* Statut (modification uniquement) */}
      {"statut" in form && (
        <div>
          <Label>Statut</Label>
          <Select
            value={(form as UpdateClientDTO).statut}
            onValueChange={(v) =>
              setForm({ ...form, statut: v as ClientStatut })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Catégorie */}
      <div>
        <Label>Catégorie</Label>
        <Select
          value={(form as any).categorie ?? "B"}
          onValueChange={(v) =>
            setForm({ ...form, categorie: v as ClientCategorie })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A — Premium</SelectItem>
            <SelectItem value="B">B — Standard</SelectItem>
            <SelectItem value="C">C — Basique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Banque */}
      <div>
        <Label>Banque</Label>
        <Select
          value={(form as any).banquePartenaire ?? "Autre"}
          onValueChange={(v) =>
            setForm({ ...form, banquePartenaire: v as BanquePartenaire })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CBAO">CBAO</SelectItem>
            <SelectItem value="CMS">CMS</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Adresse */}
      <div className="col-span-2 space-y-2">
        <Label>Adresse</Label>
        <Input
          placeholder="Rue"
          value={(form as any).adresse?.rue ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              adresse: { ...(form as any).adresse, rue: e.target.value },
            })
          }
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Ville"
            value={(form as any).adresse?.ville ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                adresse: { ...(form as any).adresse, ville: e.target.value },
              })
            }
          />
          <Input
            placeholder="Pays"
            value={(form as any).adresse?.pays ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                adresse: { ...(form as any).adresse, pays: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* Notes */}
      <div className="col-span-2">
        <Label>Notes</Label>
        <Textarea
          rows={3}
          value={(form as any).notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export function ClientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<ClientStatut | "all">("all");
  const [categorieFilter, setCategorieFilter] = useState<
    ClientCategorie | "all"
  >("all");
  const [banqueFilter, setBanqueFilter] = useState<BanquePartenaire | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const limit = 10;

  // CRUD state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [createForm, setCreateForm] = useState<CreateClientDTO>({
    ...EMPTY_FORM,
  });
  const [editForm, setEditForm] = useState<UpdateClientDTO>({});

  // Queries & mutations
  const { data, isLoading, error } = useClients({
    page,
    limit,
    search: searchQuery || undefined,
    statut: statutFilter !== "all" ? statutFilter : undefined,
    categorie: categorieFilter !== "all" ? categorieFilter : undefined,
    banque: banqueFilter !== "all" ? banqueFilter : undefined,
    sortBy: "dateCreation",
    sortOrder: "desc",
  });

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const clients = data?.data || [];
  const pagination = data?.pagination;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setCreateForm({ ...EMPTY_FORM });
    setIsCreateOpen(true);
  };

  const handleCreate = () => {
    createClient.mutate(createForm, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const openEdit = (client: Client) => {
    setEditForm({
      nom: client.nom,
      prenom: client.prenom,
      raisonSociale: client.raisonSociale,
      type: client.type,
      email: client.email,
      telephone: client.telephone,
      telephoneSecondaire: client.telephoneSecondaire,
      adresse: { ...client.adresse },
      categorie: client.categorie,
      creditLimite: client.credit.limite,
      banquePartenaire: client.banquePartenaire,
      numeroCompte: client.numeroCompte,
      statut: client.statut,
      notes: client.notes,
    });
    setEditingClient(client);
  };

  const handleUpdate = () => {
    if (!editingClient) return;
    updateClient.mutate(
      { id: editingClient.id, data: editForm },
      { onSuccess: () => setEditingClient(null) }
    );
  };

  const handleDelete = () => {
    if (!deletingClient) return;
    deleteClient.mutate(deletingClient.id, {
      onSuccess: () => setDeletingClient(null),
    });
  };

  // ── Configs d'affichage ────────────────────────────────────────────────────
  const statusConfig = {
    actif: { label: "Actif", color: "bg-green-100 text-green-800" },
    inactif: { label: "Inactif", color: "bg-gray-100 text-gray-800" },
    suspendu: { label: "Suspendu", color: "bg-red-100 text-red-800" },
  };

  const categorieConfig = {
    A: { label: "A — Premium",  color: "bg-primary/10 text-primary" },
    B: { label: "B — Standard", color: "bg-blue-100 text-blue-800" },
    C: { label: "C — Basique",  color: "bg-gray-100 text-gray-800" },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Dialog Créer ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
          </DialogHeader>
          <ClientForm form={createForm} setForm={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createClient.isPending}
            >
              {createClient.isPending ? "Enregistrement..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Modifier ── */}
      <Dialog
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <ClientForm form={editForm} setForm={setEditForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingClient(null)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateClient.isPending}
            >
              {updateClient.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog Supprimer ── */}
      <AlertDialog
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données de{" "}
              <strong>
                {deletingClient?.raisonSociale || deletingClient?.nom}
              </strong>{" "}
              seront supprimées.
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
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t("admin.customers")}
            </h2>
            <p className="text-muted-foreground">Gérer la base de clients</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un client (nom, email, code)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Statut
                  </label>
                  <Select
                    value={statutFilter}
                    onValueChange={(v) =>
                      setStatutFilter(v as ClientStatut | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Catégorie
                  </label>
                  <Select
                    value={categorieFilter}
                    onValueChange={(v) =>
                      setCategorieFilter(v as ClientCategorie | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="A">A — Premium</SelectItem>
                      <SelectItem value="B">B — Standard</SelectItem>
                      <SelectItem value="C">C — Basique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Banque
                  </label>
                  <Select
                    value={banqueFilter}
                    onValueChange={(v) =>
                      setBanqueFilter(v as BanquePartenaire | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les banques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les banques</SelectItem>
                      <SelectItem value="CBAO">CBAO</SelectItem>
                      <SelectItem value="CMS">CMS</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading
                ? "Chargement..."
                : `${pagination?.total || 0} client(s)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8 text-destructive">
                Erreur lors du chargement des clients
              </div>
            )}

            {!error && clients.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun client trouvé
              </div>
            )}

            {!error && clients.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Client</TableHead>
                      <TableHead className="whitespace-nowrap">Contact</TableHead>
                      <TableHead className="whitespace-nowrap">Banque</TableHead>
                      <TableHead className="whitespace-nowrap">Catégorie</TableHead>
                      <TableHead className="whitespace-nowrap">Crédit</TableHead>
                      <TableHead className="whitespace-nowrap">Total achats</TableHead>
                      <TableHead className="whitespace-nowrap">Statut</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => navigate(`/admin/commercial/clients/${client.id}`)}
                      >
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                              {client.type === "entreprise" ? (
                                <Building2 className="h-5 w-5 text-primary" />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {client.type === "entreprise"
                                  ? client.raisonSociale
                                  : `${client.nom} ${client.prenom || ""}`}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {client.code}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {client.telephone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline">
                            {client.banquePartenaire}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`whitespace-nowrap ${categorieConfig[client.categorie].color}`}
                          >
                            {categorieConfig[client.categorie].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {formatCurrency(client.credit.disponible)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              / {formatCurrency(client.credit.limite)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {formatCurrency(client.totalAchats)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {client.nombreCommandes} commande(s)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={statusConfig[client.statut].color}
                          >
                            {statusConfig[client.statut].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/admin/commercial/clients/${client.id}`
                                  )
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir profil
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(client)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingClient(client)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} sur {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ClientsPage;
