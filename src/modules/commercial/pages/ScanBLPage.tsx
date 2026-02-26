import { useState } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  ScanLine,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Link as LinkIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCommandes } from "../hooks/useCommandes";
import { toast } from "@/hooks/use-toast";

// Types pour les BL (Bons de Livraison)
interface BonLivraison {
  id: string;
  reference: string;
  commandeId?: string;
  commandeRef?: string;
  fichierUrl: string;
  fichierNom: string;
  dateUpload: string;
  dateLivraison: string;
  transporteur?: string;
  statut: "en_attente" | "valide" | "rejete";
  donnees: {
    numerobl?: string;
    fournisseur?: string;
    montant?: number;
    articles?: Array<{
      designation: string;
      quantite: number;
      prixUnitaire?: number;
    }>;
  };
  notes?: string;
  validepar?: string;
  dateValidation?: string;
}

// Mock data pour les BL
const MOCK_BL: BonLivraison[] = [
  {
    id: "bl-001",
    reference: "BL-2024-001",
    commandeId: "cmd-001",
    commandeRef: "CMD-2024-001",
    fichierUrl: "/uploads/bl-001.pdf",
    fichierNom: "BL_CMD001_2024.pdf",
    dateUpload: "2024-12-20",
    dateLivraison: "2024-12-19",
    transporteur: "DHL Express",
    statut: "valide",
    donnees: {
      numerobl: "DHL/BL/2024/0001",
      fournisseur: "Fournisseur A",
      montant: 5600000,
      articles: [
        { designation: "Ordinateur Portable Pro", quantite: 5, prixUnitaire: 850000 },
        { designation: "Écran Moniteur 27\"", quantite: 10, prixUnitaire: 185000 },
      ],
    },
    notes: "Livraison conforme à la commande",
    validepar: "user-001",
    dateValidation: "2024-12-20",
  },
  {
    id: "bl-002",
    reference: "BL-2024-002",
    fichierUrl: "/uploads/bl-002.pdf",
    fichierNom: "BL_Sans_Commande_2024.pdf",
    dateUpload: "2024-12-21",
    dateLivraison: "2024-12-21",
    transporteur: "FedEx",
    statut: "en_attente",
    donnees: {
      numerobl: "FDX/BL/2024/0015",
      fournisseur: "Fournisseur B",
      montant: 2400000,
      articles: [
        { designation: "Imprimante Multifonction", quantite: 3, prixUnitaire: 800000 },
      ],
    },
    notes: "En attente d'association à une commande",
  },
];

export function ScanBLPage() {
  const { t } = useTranslation();
  const [bls, setBls] = useState<BonLivraison[]>(MOCK_BL);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBL, setSelectedBL] = useState<BonLivraison | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statutFilter, setStatutFilter] = useState<"all" | "en_attente" | "valide" | "rejete">(
    "all"
  );

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    commandeId: "",
    dateLivraison: new Date().toISOString().split("T")[0],
    transporteur: "",
    notes: "",
  });

  // Fetch commandes for linking
  const { data: commandesData } = useCommandes({ limit: 100 });
  const commandes = commandesData?.data || [];

  const statutConfig = {
    en_attente: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    valide: {
      label: "Validé",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    rejete: {
      label: "Rejeté",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const filteredBLs = bls.filter((bl) => {
    if (statutFilter === "all") return true;
    return bl.statut === statutFilter;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: "Veuillez sélectionner un fichier PDF ou une image (JPG, PNG)",
          variant: "destructive",
        });
        return;
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 10 MB",
          variant: "destructive",
        });
        return;
      }

      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadForm.file) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez sélectionner un fichier à téléverser",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate OCR extraction
    const newBL: BonLivraison = {
      id: `bl-${Date.now()}`,
      reference: `BL-2024-${String(bls.length + 1).padStart(3, "0")}`,
      commandeId: uploadForm.commandeId || undefined,
      commandeRef: uploadForm.commandeId
        ? commandes.find((c) => c.id === uploadForm.commandeId)?.reference
        : undefined,
      fichierUrl: URL.createObjectURL(uploadForm.file),
      fichierNom: uploadForm.file.name,
      dateUpload: new Date().toISOString().split("T")[0],
      dateLivraison: uploadForm.dateLivraison,
      transporteur: uploadForm.transporteur || undefined,
      statut: "en_attente",
      donnees: {
        numerobl: `AUTO/BL/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        fournisseur: "Détecté automatiquement",
        montant: Math.floor(Math.random() * 5000000) + 1000000,
        articles: [
          {
            designation: "Article détecté par OCR",
            quantite: Math.floor(Math.random() * 10) + 1,
            prixUnitaire: Math.floor(Math.random() * 500000) + 100000,
          },
        ],
      },
      notes: uploadForm.notes || undefined,
    };

    setBls([newBL, ...bls]);
    setIsProcessing(false);
    setIsUploadDialogOpen(false);
    setUploadForm({
      file: null,
      commandeId: "",
      dateLivraison: new Date().toISOString().split("T")[0],
      transporteur: "",
      notes: "",
    });

    toast({
      title: "BL scanné avec succès",
      description: "Le bon de livraison a été traité et ajouté à la liste",
    });
  };

  const handleViewDetails = (bl: BonLivraison) => {
    setSelectedBL(bl);
    setIsDetailsOpen(true);
  };

  const handleValidateBL = (blId: string) => {
    setBls(
      bls.map((bl) =>
        bl.id === blId
          ? {
              ...bl,
              statut: "valide" as const,
              validepar: "user-001",
              dateValidation: new Date().toISOString().split("T")[0],
            }
          : bl
      )
    );
    toast({
      title: "BL validé",
      description: "Le bon de livraison a été validé avec succès",
    });
    setIsDetailsOpen(false);
  };

  const handleRejectBL = (blId: string) => {
    setBls(bls.map((bl) => (bl.id === blId ? { ...bl, statut: "rejete" as const } : bl)));
    toast({
      title: "BL rejeté",
      description: "Le bon de livraison a été rejeté",
      variant: "destructive",
    });
    setIsDetailsOpen(false);
  };

  const stats = {
    total: bls.length,
    enAttente: bls.filter((bl) => bl.statut === "en_attente").length,
    valides: bls.filter((bl) => bl.statut === "valide").length,
    rejetes: bls.filter((bl) => bl.statut === "rejete").length,
  };

  return (
    <>
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Nouveau scan BL</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="file">Fichier BL (PDF ou Image)</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {uploadForm.file && (
                  <Badge variant="outline" className="bg-green-50">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {uploadForm.file.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Formats acceptés: PDF, JPG, PNG (max 10 MB)
              </p>
            </div>

            {/* Commande (optional) */}
            <div>
              <Label htmlFor="commande">Commande associée (optionnel)</Label>
              <Select
                value={uploadForm.commandeId}
                onValueChange={(value) => setUploadForm({ ...uploadForm, commandeId: value })}
              >
                <SelectTrigger id="commande">
                  <SelectValue placeholder="Aucune commande (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {commandes.map((cmd) => (
                    <SelectItem key={cmd.id} value={cmd.id}>
                      {cmd.reference} - {formatCurrency(cmd.total)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date livraison */}
            <div>
              <Label htmlFor="dateLivraison">Date de livraison</Label>
              <Input
                id="dateLivraison"
                type="date"
                value={uploadForm.dateLivraison}
                onChange={(e) => setUploadForm({ ...uploadForm, dateLivraison: e.target.value })}
              />
            </div>

            {/* Transporteur */}
            <div>
              <Label htmlFor="transporteur">Transporteur (optionnel)</Label>
              <Input
                id="transporteur"
                placeholder="Ex: DHL, FedEx, UPS..."
                value={uploadForm.transporteur}
                onChange={(e) => setUploadForm({ ...uploadForm, transporteur: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Observations sur la livraison..."
                rows={3}
                value={uploadForm.notes}
                onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
              />
            </div>

            {/* Info OCR */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold">Traitement automatique</p>
                  <p className="text-blue-700">
                    Le système extraira automatiquement les informations du BL (numéro, fournisseur,
                    articles, montant) via OCR.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUploadSubmit} disabled={!uploadForm.file || isProcessing}>
              {isProcessing ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Traitement OCR...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Scanner le BL
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">BL {selectedBL?.reference}</DialogTitle>
          </DialogHeader>

          {selectedBL && (
            <div className="space-y-6">
              {/* Info principale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Numéro BL</p>
                  <p className="font-mono font-semibold">{selectedBL.donnees.numerobl}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant="outline" className={statutConfig[selectedBL.statut].color}>
                    {statutConfig[selectedBL.statut].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date livraison</p>
                  <p className="font-semibold">{selectedBL.dateLivraison}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date upload</p>
                  <p className="font-semibold">{selectedBL.dateUpload}</p>
                </div>
                {selectedBL.transporteur && (
                  <div>
                    <p className="text-sm text-muted-foreground">Transporteur</p>
                    <p className="font-semibold">{selectedBL.transporteur}</p>
                  </div>
                )}
                {selectedBL.commandeRef && (
                  <div>
                    <p className="text-sm text-muted-foreground">Commande liée</p>
                    <Badge variant="outline">
                      <LinkIcon className="mr-1 h-3 w-3" />
                      {selectedBL.commandeRef}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Fichier */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{selectedBL.fichierNom}</p>
                      <p className="text-sm text-muted-foreground">Document scanné</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                </div>
              </div>

              {/* Données extraites (OCR) */}
              <div>
                <h3 className="font-semibold mb-3">Données extraites (OCR)</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm text-muted-foreground">Fournisseur</p>
                      <p className="font-semibold">{selectedBL.donnees.fournisseur}</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm text-muted-foreground">Montant total</p>
                      <p className="font-semibold text-lg">
                        {selectedBL.donnees.montant
                          ? formatCurrency(selectedBL.donnees.montant)
                          : "Non spécifié"}
                      </p>
                    </div>
                  </div>

                  {selectedBL.donnees.articles && selectedBL.donnees.articles.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Articles</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Désignation</TableHead>
                            <TableHead className="text-right">Quantité</TableHead>
                            <TableHead className="text-right">Prix unitaire</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBL.donnees.articles.map((article, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{article.designation}</TableCell>
                              <TableCell className="text-right">{article.quantite}</TableCell>
                              <TableCell className="text-right">
                                {article.prixUnitaire
                                  ? formatCurrency(article.prixUnitaire)
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {article.prixUnitaire
                                  ? formatCurrency(article.prixUnitaire * article.quantite)
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedBL.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground">{selectedBL.notes}</p>
                </div>
              )}

              {/* Validation info */}
              {selectedBL.statut === "valide" && selectedBL.dateValidation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Validé le {selectedBL.dateValidation}</p>
                      <p className="text-sm">Par {selectedBL.validepar}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedBL?.statut === "en_attente" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedBL && handleRejectBL(selectedBL.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button onClick={() => selectedBL && handleValidateBL(selectedBL.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider
                </Button>
              </>
            )}
            {selectedBL?.statut !== "en_attente" && (
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Fermer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Page Content */}
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Scan des Bons de Livraison</h2>
            <p className="text-muted-foreground">
              Numérisation et traitement automatique des BL par OCR
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <ScanLine className="mr-2 h-4 w-4" />
            Scanner un BL
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total BL</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enAttente}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.valides}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejetes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">Filtrer par statut:</Label>
              <Select
                value={statutFilter}
                onValueChange={(value: any) => setStatutFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="valide">Validés</SelectItem>
                  <SelectItem value="rejete">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* BL Table */}
        <Card>
          <CardHeader>
            <CardTitle>{filteredBLs.length} bon(s) de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBLs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun bon de livraison trouvé
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Numéro BL</TableHead>
                    <TableHead>Commande liée</TableHead>
                    <TableHead>Date livraison</TableHead>
                    <TableHead>Transporteur</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBLs.map((bl) => {
                    const StatusIcon = statutConfig[bl.statut].icon;
                    return (
                      <TableRow key={bl.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {bl.reference}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {bl.donnees.numerobl}
                        </TableCell>
                        <TableCell>
                          {bl.commandeRef ? (
                            <Badge variant="outline">
                              <LinkIcon className="mr-1 h-3 w-3" />
                              {bl.commandeRef}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Non lié</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{bl.dateLivraison}</TableCell>
                        <TableCell className="text-sm">
                          {bl.transporteur || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {bl.donnees.montant ? formatCurrency(bl.donnees.montant) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statutConfig[bl.statut].color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statutConfig[bl.statut].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(bl)}>
                            <Eye className="h-4 w-4" />
                          </Button>
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

export default ScanBLPage;
