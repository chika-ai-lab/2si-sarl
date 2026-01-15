import { useState } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  useAccreditifs,
  useAccreditifsExpirantBientot,
  useCreateAccreditif,
  useChangeAccreditifStatut,
  useUploadDocument,
} from "../hooks/useAccreditifs";
import type { AccreditifStatut, BanquePartenaire, Accreditif } from "../types";
import { toast } from "@/hooks/use-toast";

export function AccreditifPage() {
  const { t } = useTranslation();

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [banqueFilter, setBanqueFilter] = useState<BanquePartenaire | "all">("all");
  const [statutFilter, setStatutFilter] = useState<AccreditifStatut | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedAccreditif, setSelectedAccreditif] = useState<Accreditif | null>(null);

  // Formulaire création
  const [formData, setFormData] = useState({
    numeroAccreditif: "",
    banqueEmettrice: "CBAO" as BanquePartenaire,
    banqueBeneficiaire: "",
    montant: 0,
    devise: "FCFA" as "FCFA" | "EUR" | "USD",
    dateExpiration: "",
    notes: "",
  });

  // Fetch data
  const { data, isLoading, error } = useAccreditifs({
    page,
    limit,
    search: searchQuery || undefined,
    banqueEmettrice: banqueFilter !== "all" ? banqueFilter : undefined,
    statut: statutFilter !== "all" ? statutFilter : undefined,
    sortBy: "dateEmission",
    sortOrder: "desc",
  });

  const { data: alertesData } = useAccreditifsExpirantBientot(30);

  const accreditifs = data?.data || [];
  const pagination = data?.pagination;
  const alertes = alertesData?.data || [];

  // Mutations
  const createAccreditif = useCreateAccreditif();
  const changeStatut = useChangeAccreditifStatut();
  const uploadDocument = useUploadDocument();

  // Configuration des statuts
  const statusConfig = {
    en_attente: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    approuve: {
      label: "Approuvé",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    execute: {
      label: "Exécuté",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    expire: {
      label: "Expiré",
      color: "bg-gray-100 text-gray-800",
      icon: XCircle,
    },
    annule: {
      label: "Annulé",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  // Créer un accréditif
  const handleCreateAccreditif = async () => {
    if (!formData.numeroAccreditif || !formData.banqueBeneficiaire || formData.montant <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createAccreditif.mutateAsync(formData);

      if (result.success) {
        toast({
          title: "Accréditif créé",
          description: `Référence: ${result.data?.reference}`,
        });

        setIsCreateDialogOpen(false);
        setFormData({
          numeroAccreditif: "",
          banqueEmettrice: "CBAO",
          banqueBeneficiaire: "",
          montant: 0,
          devise: "FCFA",
          dateExpiration: "",
          notes: "",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'accréditif",
        variant: "destructive",
      });
    }
  };

  // Changer le statut
  const handleChangeStatut = async (id: string, statut: AccreditifStatut) => {
    try {
      const result = await changeStatut.mutateAsync({ id, statut });

      if (result.success) {
        toast({
          title: "Statut mis à jour",
          description: `Accréditif ${result.data?.reference} - ${statusConfig[statut].label}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive",
      });
    }
  };

  // Voir les détails
  const handleViewDetails = (accreditif: Accreditif) => {
    setSelectedAccreditif(accreditif);
    setIsDetailsDialogOpen(true);
  };

  return (
    <>
      {/* Dialog Création */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau accrédititif</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Numéro accréditif *</Label>
                <Input
                  value={formData.numeroAccreditif}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroAccreditif: e.target.value })
                  }
                  placeholder="CBAO/LC/2024/0001"
                />
              </div>
              <div>
                <Label>Banque émettrice *</Label>
                <Select
                  value={formData.banqueEmettrice}
                  onValueChange={(value) =>
                    setFormData({ ...formData, banqueEmettrice: value as BanquePartenaire })
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
            </div>

            <div>
              <Label>Banque bénéficiaire *</Label>
              <Input
                value={formData.banqueBeneficiaire}
                onChange={(e) =>
                  setFormData({ ...formData, banqueBeneficiaire: e.target.value })
                }
                placeholder="Citibank Paris"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Montant *</Label>
                <Input
                  type="number"
                  value={formData.montant}
                  onChange={(e) =>
                    setFormData({ ...formData, montant: Number(e.target.value) })
                  }
                  placeholder="15000000"
                />
              </div>
              <div>
                <Label>Devise</Label>
                <Select
                  value={formData.devise}
                  onValueChange={(value) =>
                    setFormData({ ...formData, devise: value as "FCFA" | "EUR" | "USD" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCFA">FCFA</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Date d'expiration *</Label>
              <Input
                type="date"
                value={formData.dateExpiration}
                onChange={(e) =>
                  setFormData({ ...formData, dateExpiration: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateAccreditif} disabled={createAccreditif.isPending}>
              Créer l'accréditif
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedAccreditif?.reference}</span>
              {selectedAccreditif && (
                <Badge
                  variant="outline"
                  className={statusConfig[selectedAccreditif.statut].color}
                >
                  {statusConfig[selectedAccreditif.statut].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedAccreditif && (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Numéro accréditif</p>
                  <p className="font-mono font-semibold">
                    {selectedAccreditif.numeroAccreditif}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(selectedAccreditif.montant)} {selectedAccreditif.devise}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banque émettrice</p>
                  <Badge variant="outline">{selectedAccreditif.banqueEmettrice}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banque bénéficiaire</p>
                  <p className="font-medium">{selectedAccreditif.banqueBeneficiaire}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date d'émission</p>
                  <p className="font-medium">{selectedAccreditif.dateEmission}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date d'expiration</p>
                  <p className="font-medium">{selectedAccreditif.dateExpiration}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold mb-3">Documents</h3>
                {selectedAccreditif.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAccreditif.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.nom}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} - {doc.dateUpload}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun document uploadé</p>
                )}
              </div>

              {/* Notes */}
              {selectedAccreditif.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground">{selectedAccreditif.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleChangeStatut(selectedAccreditif.id, "approuve")
                  }
                  disabled={selectedAccreditif.statut === "approuve"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleChangeStatut(selectedAccreditif.id, "execute")}
                  disabled={selectedAccreditif.statut === "execute"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer exécuté
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleChangeStatut(selectedAccreditif.id, "annule")}
                  disabled={selectedAccreditif.statut === "annule"}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Accréditifs
            </h2>
            <p className="text-muted-foreground">
              Gestion des lettres de crédit et garanties bancaires
            </p>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel accréditif
          </Button>
        </div>

        {/* Alertes expiration */}
        {alertes.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Alertes d'expiration ({alertes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">
                {alertes.length} accréditif(s) expire(nt) dans les 30 prochains jours
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence, numéro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Banque émettrice</Label>
                  <Select
                    value={banqueFilter}
                    onValueChange={(value) =>
                      setBanqueFilter(value as BanquePartenaire | "all")
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

                <div>
                  <Label>Statut</Label>
                  <Select
                    value={statutFilter}
                    onValueChange={(value) =>
                      setStatutFilter(value as AccreditifStatut | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="approuve">Approuvé</SelectItem>
                      <SelectItem value="execute">Exécuté</SelectItem>
                      <SelectItem value="expire">Expiré</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accréditifs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading ? "Chargement..." : `${pagination?.total || 0} accréditif(s)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8 text-destructive">
                Erreur lors du chargement des accréditifs
              </div>
            )}

            {!error && accreditifs.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun accréditif trouvé
              </div>
            )}

            {!error && accreditifs.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Banque</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accreditifs.map((accreditif) => (
                      <TableRow key={accreditif.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{accreditif.reference}</div>
                            <div className="text-sm text-muted-foreground">
                              {accreditif.dateEmission}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {accreditif.numeroAccreditif}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{accreditif.banqueEmettrice}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(accreditif.montant)} {accreditif.devise}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{accreditif.dateExpiration}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig[accreditif.statut].color}
                          >
                            {statusConfig[accreditif.statut].label}
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
                              <DropdownMenuItem onClick={() => handleViewDetails(accreditif)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Upload className="mr-2 h-4 w-4" />
                                Uploader document
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

export default AccreditifPage;
