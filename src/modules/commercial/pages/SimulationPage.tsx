import { useState, useEffect } from "react";
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
  Calculator,
  Plus,
  Trash2,
  Save,
  Send,
  FileDown,
  ShoppingCart
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useProduits } from "../hooks/useProduits";
import { useCreateSimulation, useGenererPDFDevis, useEnvoyerDevisEmail } from "../hooks/useSimulations";
import { calculerTotalSimulation } from "../services/simulations.service";
import type { ProduitCatalogue, ProduitSimulation } from "../types";
import { toast } from "@/hooks/use-toast";

export function SimulationPage() {
  const { t } = useTranslation();

  // États pour le formulaire
  const [lignesProduits, setLignesProduits] = useState<ProduitSimulation[]>([]);
  const [fraisAdditionnels, setFraisAdditionnels] = useState(0);
  const [notes, setNotes] = useState("");
  const [validiteJours, setValiditeJours] = useState(30);

  // Dialog pour ajouter un produit
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduitId, setSelectedProduitId] = useState<string>("");
  const [quantite, setQuantite] = useState(1);
  const [remisePercentage, setRemisePercentage] = useState(0);

  // Fetch produits
  const { data: produitsData } = useProduits({ limit: 100 });
  const produits = produitsData?.data || [];

  // Mutations
  const createSimulation = useCreateSimulation();
  const genererPDF = useGenererPDFDevis();
  const envoyerEmail = useEnvoyerDevisEmail();

  // Calculs automatiques
  const totaux = calculerTotalSimulation(lignesProduits, 0.18, fraisAdditionnels);

  // Ajouter un produit à la simulation
  const handleAddProduit = () => {
    const produit = produits.find(p => p.id === selectedProduitId);
    if (!produit) return;

    const totalLigne = produit.prixVente * quantite;
    const remiseMontant = (totalLigne * remisePercentage) / 100;

    const nouvelleLigne: ProduitSimulation = {
      produitId: produit.id,
      produit,
      quantite,
      prixUnitaire: produit.prixVente,
      remisePercentage,
      remiseMontant,
    };

    setLignesProduits([...lignesProduits, nouvelleLigne]);

    // Reset form
    setSelectedProduitId("");
    setQuantite(1);
    setRemisePercentage(0);
    setIsAddProductOpen(false);

    toast({
      title: "Produit ajouté",
      description: `${produit.nom} a été ajouté au devis`,
    });
  };

  // Supprimer un produit
  const handleRemoveProduit = (index: number) => {
    const newLignes = [...lignesProduits];
    newLignes.splice(index, 1);
    setLignesProduits(newLignes);
  };

  // Sauvegarder comme brouillon
  const handleSaveBrouillon = async () => {
    if (lignesProduits.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createSimulation.mutateAsync({
        produits: lignesProduits,
        fraisAdditionnels,
        validiteJours,
        notes,
      });

      if (result.success) {
        toast({
          title: "Devis sauvegardé",
          description: `Référence: ${result.data?.reference}`,
        });

        // Reset form
        setLignesProduits([]);
        setFraisAdditionnels(0);
        setNotes("");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le devis",
        variant: "destructive",
      });
    }
  };

  // Générer PDF
  const handleGenererPDF = async () => {
    if (lignesProduits.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive",
      });
      return;
    }

    try {
      // D'abord créer la simulation
      const simResult = await createSimulation.mutateAsync({
        produits: lignesProduits,
        fraisAdditionnels,
        validiteJours,
        notes,
      });

      if (simResult.success && simResult.data) {
        // Ensuite générer le PDF
        const pdfResult = await genererPDF.mutateAsync(simResult.data.id);

        if (pdfResult.success) {
          toast({
            title: "PDF généré",
            description: "Le devis PDF est prêt au téléchargement",
          });

          // Simuler le téléchargement
          window.open(pdfResult.data?.url, '_blank');
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Dialog pour ajouter un produit */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un produit au devis</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Produit</Label>
              <Select value={selectedProduitId} onValueChange={setSelectedProduitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {produits.map((produit) => (
                    <SelectItem key={produit.id} value={produit.id}>
                      {produit.nom} - {formatCurrency(produit.prixVente)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantite}
                  onChange={(e) => setQuantite(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Remise (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={remisePercentage}
                  onChange={(e) => setRemisePercentage(Number(e.target.value))}
                />
              </div>
            </div>

            {selectedProduitId && (
              <div className="p-3 bg-muted rounded">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Prix unitaire:</span>
                    <span className="font-medium">
                      {formatCurrency(produits.find(p => p.id === selectedProduitId)?.prixVente || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Sous-total:</span>
                    <span className="font-medium">
                      {formatCurrency((produits.find(p => p.id === selectedProduitId)?.prixVente || 0) * quantite)}
                    </span>
                  </div>
                  {remisePercentage > 0 && (
                    <div className="flex justify-between mb-1 text-orange-600">
                      <span>Remise ({remisePercentage}%):</span>
                      <span>
                        -{formatCurrency(((produits.find(p => p.id === selectedProduitId)?.prixVente || 0) * quantite * remisePercentage) / 100)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="font-semibold">Total ligne:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        ((produits.find(p => p.id === selectedProduitId)?.prixVente || 0) * quantite) *
                        (1 - remisePercentage / 100)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddProduit} disabled={!selectedProduitId}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              Simulation / Devis
            </h2>
            <p className="text-muted-foreground">
              Créer un devis pour un client avec calcul automatique
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveBrouillon} disabled={createSimulation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleGenererPDF} disabled={genererPDF.isPending}>
              <FileDown className="mr-2 h-4 w-4" />
              Générer PDF
            </Button>
          </div>
        </div>

        {/* Produits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produits</CardTitle>
              <Button onClick={() => setIsAddProductOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lignesProduits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun produit ajouté</p>
                <p className="text-sm">Cliquez sur "Ajouter un produit" pour commencer</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Qté</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Remise</TableHead>
                    <TableHead>Total HT</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignesProduits.map((ligne, index) => {
                    const totalLigne = ligne.prixUnitaire * ligne.quantite;
                    const totalApresRemise = totalLigne - ligne.remiseMontant;

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ligne.produit?.nom}</div>
                            <div className="text-sm text-muted-foreground">
                              {ligne.produit?.reference}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{ligne.quantite}</TableCell>
                        <TableCell>{formatCurrency(ligne.prixUnitaire)}</TableCell>
                        <TableCell>
                          {ligne.remisePercentage > 0 ? (
                            <div className="text-orange-600">
                              {ligne.remisePercentage}%
                              <div className="text-xs">
                                -{formatCurrency(ligne.remiseMontant)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(totalApresRemise)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduit(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* Calculs et Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Frais additionnels (FCFA)</Label>
                <Input
                  type="number"
                  min="0"
                  value={fraisAdditionnels}
                  onChange={(e) => setFraisAdditionnels(Number(e.target.value))}
                  placeholder="Transport, installation, etc."
                />
              </div>

              <div>
                <Label>Validité du devis (jours)</Label>
                <Select
                  value={validiteJours.toString()}
                  onValueChange={(v) => setValiditeJours(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 jours</SelectItem>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="45">45 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes / Conditions particulières</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions spéciales, conditions de paiement, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Totaux */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT:</span>
                  <span className="font-medium">{formatCurrency(totaux.sousTotal)}</span>
                </div>

                {totaux.remiseTotale > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Remise totale:</span>
                    <span>-{formatCurrency(totaux.remiseTotale)}</span>
                  </div>
                )}

                {fraisAdditionnels > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais additionnels:</span>
                    <span className="font-medium">{formatCurrency(fraisAdditionnels)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant HT:</span>
                    <span className="font-medium">
                      {formatCurrency(totaux.sousTotal - totaux.remiseTotale + fraisAdditionnels)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA (18%):</span>
                  <span className="font-medium">{formatCurrency(totaux.taxe)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total TTC:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(totaux.total)}
                    </span>
                  </div>
                </div>

                {totaux.marge > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Marge estimée:</span>
                      <span className="font-semibold">
                        {formatCurrency(totaux.marge)} ({totaux.pourcentageMarge}%)
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Paiement: Comptant uniquement
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default SimulationPage;
