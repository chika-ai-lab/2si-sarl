import { useState } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCommandes } from "../hooks/useCommandes";
import { useClients } from "../hooks/useClients";
import type {
  CommandeCommerciale,
  CommandeStatut,
  ModePaiement,
  BanquePartenaire,
} from "../types";
import { toast } from "@/hooks/use-toast";

export function CommandesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<CommandeStatut | "all">("all");
  const [modePaiementFilter, setModePaiementFilter] = useState<ModePaiement | "all">("all");
  const [banqueFilter, setBanqueFilter] = useState<BanquePartenaire | "all">("all");
  const [selectedCommande, setSelectedCommande] = useState<CommandeCommerciale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch commandes with filters
  const { data, isLoading, error } = useCommandes({
    page,
    limit,
    search: searchQuery || undefined,
    statut: statutFilter !== "all" ? statutFilter : undefined,
    modePaiement: modePaiementFilter !== "all" ? modePaiementFilter : undefined,
    banque: banqueFilter !== "all" ? banqueFilter : undefined,
    sortBy: "dateCommande",
    sortOrder: "desc",
  });

  // Fetch clients for display
  const { data: clientsData } = useClients({ limit: 1000 });
  const clients = clientsData?.data || [];

  const commandes = data?.data || [];
  const pagination = data?.pagination;

  const statutConfig = {
    brouillon: {
      label: "Brouillon",
      color: "bg-gray-100 text-gray-800",
      icon: Edit,
    },
    en_attente: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    validee: {
      label: "Validée",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    en_cours: {
      label: "En cours",
      color: "bg-purple-100 text-purple-800",
      icon: Package,
    },
    livree: {
      label: "Livrée",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    annulee: {
      label: "Annulée",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const paiementStatusConfig = {
    non_paye: { label: "Non payé", color: "bg-red-100 text-red-800" },
    partiel: { label: "Partiel", color: "bg-orange-100 text-orange-800" },
    paye: { label: "Payé", color: "bg-green-100 text-green-800" },
  };

  const handleViewDetails = (commande: CommandeCommerciale) => {
    setSelectedCommande(commande);
    setIsDetailsOpen(true);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.nom : clientId;
  };

  return (
    <>
      {/* Commande Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Commande {selectedCommande?.reference}
            </DialogTitle>
          </DialogHeader>

          {selectedCommande && (
            <div className="space-y-6">
              {/* Info principale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{getClientName(selectedCommande.clientId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date commande</p>
                  <p className="font-semibold">{selectedCommande.dateCommande}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge
                    variant="outline"
                    className={statutConfig[selectedCommande.statut].color}
                  >
                    {statutConfig[selectedCommande.statut].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mode de paiement</p>
                  <Badge variant="outline">{selectedCommande.modePaiement}</Badge>
                </div>
                {selectedCommande.banque && (
                  <div>
                    <p className="text-sm text-muted-foreground">Garant financier</p>
                    <Badge variant="outline">{selectedCommande.banque}</Badge>
                  </div>
                )}
                {selectedCommande.dateValidation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date validation</p>
                    <p className="font-semibold">{selectedCommande.dateValidation}</p>
                  </div>
                )}
              </div>

              {/* Lignes de commande */}
              <div>
                <h3 className="font-semibold mb-3">Articles commandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit ID</TableHead>
                      <TableHead className="text-right">Qté</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Remise</TableHead>
                      <TableHead className="text-right">Sous-total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCommande.lignes.map((ligne) => (
                      <TableRow key={ligne.id}>
                        <TableCell>
                          <div className="font-medium">{ligne.produitId}</div>
                        </TableCell>
                        <TableCell className="text-right">{ligne.quantite}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(ligne.prixUnitaire)}
                        </TableCell>
                        <TableCell className="text-right">
                          {ligne.remise ? `${ligne.remise}%` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(ligne.sousTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totaux */}
              <div className="border-t pt-4">
                <div className="space-y-2 max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{formatCurrency(selectedCommande.sousTotal)}</span>
                  </div>
                  {selectedCommande.remise > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Remise</span>
                      <span>
                        -{formatCurrency(selectedCommande.remise)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA</span>
                    <span className="font-semibold">{formatCurrency(selectedCommande.taxe)}</span>
                  </div>
                  {selectedCommande.fraisLivraison > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frais de livraison</span>
                      <span className="font-semibold">{formatCurrency(selectedCommande.fraisLivraison)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total TTC</span>
                    <span>{formatCurrency(selectedCommande.total)}</span>
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Informations de paiement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mode de paiement</p>
                    <Badge variant="outline">{selectedCommande.modePaiement}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut paiement</p>
                    <Badge
                      variant="outline"
                      className={paiementStatusConfig[selectedCommande.statutPaiement].color}
                    >
                      {paiementStatusConfig[selectedCommande.statutPaiement].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant payé</p>
                    <p className="font-semibold">
                      {formatCurrency(selectedCommande.montantPaye)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant restant</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(selectedCommande.total - selectedCommande.montantPaye)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCommande.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground">{selectedCommande.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fermer
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Générer facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t("admin.orders")}
            </h2>
            <p className="text-muted-foreground">
              Gestion des commandes commerciales et suivi des livraisons
            </p>
          </div>
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nouvelle commande
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commandes.filter((c) => c.statut === "en_attente").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commandes.filter((c) => c.statut === "en_cours").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livrées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commandes.filter((c) => c.statut === "livree").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence, client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Statut</label>
                  <Select
                    value={statutFilter}
                    onValueChange={(value) => setStatutFilter(value as CommandeStatut | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Mode de paiement</label>
                  <Select
                    value={modePaiementFilter}
                    onValueChange={(value) => setModePaiementFilter(value as ModePaiement | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les modes</SelectItem>
                      <SelectItem value="Comptant">Comptant</SelectItem>
                      <SelectItem value="Crédit">Crédit</SelectItem>
                      <SelectItem value="Accréditif">Accréditif</SelectItem>
                      <SelectItem value="Virement">Virement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Garant financier</label>
                  <Select
                    value={banqueFilter}
                    onValueChange={(value) => setBanqueFilter(value as BanquePartenaire | "all")}
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

        {/* Commandes Table */}
        <CommandesTable
          commandes={commandes}
          isLoading={isLoading}
          error={error}
          statutConfig={statutConfig}
          paiementStatusConfig={paiementStatusConfig}
          pagination={pagination}
          page={page}
          setPage={setPage}
          onViewDetails={handleViewDetails}
          getClientName={getClientName}
        />
      </div>
    </>
  );
}

// Component for displaying commandes table
function CommandesTable({
  commandes,
  isLoading,
  error,
  statutConfig,
  paiementStatusConfig,
  pagination,
  page,
  setPage,
  onViewDetails,
  getClientName,
}: any) {
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            Erreur lors du chargement des commandes
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (commandes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Aucune commande trouvée</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{pagination?.total || 0} commande(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Mode paiement</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commandes.map((commande: CommandeCommerciale) => {
                const StatusIcon = statutConfig[commande.statut].icon;
                return (
                  <TableRow key={commande.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {commande.reference}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getClientName(commande.clientId)}</div>
                      <div className="text-sm text-muted-foreground">
                        {commande.lignes.length} article(s)
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{commande.dateCommande}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {commande.modePaiement}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(commande.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statutConfig[commande.statut].color}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statutConfig[commande.statut].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={paiementStatusConfig[commande.statutPaiement].color}
                      >
                        {paiementStatusConfig[commande.statutPaiement].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails(commande)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Générer facture
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
  );
}

export default CommandesPage;
