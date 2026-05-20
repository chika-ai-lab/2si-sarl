import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Calculator,
  Package,
  Trash2,
  Save,
  FileDown,
  ShoppingCart,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { ProductPickerSheet, type BackendArticle, type LigneForm } from "../components/ProductPickerSheet";
import { useCreateSimulation, useGenererPDFDevis } from "../hooks/useSimulations";
import { calculerTotalSimulation } from "../services/simulations.service";
import type { ProduitSimulation } from "../types";
import { toast } from "@/hooks/use-toast";

export function SimulationPage() {
  const { t } = useTranslation();

  // États pour le formulaire
  const [lignesProduits, setLignesProduits] = useState<ProduitSimulation[]>([]);
  const [fraisAdditionnels, setFraisAdditionnels] = useState(0);
  const [notes, setNotes] = useState("");
  const [validiteJours, setValiditeJours] = useState(30);
  const [tvaActive, setTvaActive] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Fetch articles (même source que VentesPage / CreateCommandeDialog)
  const { data: articlesRaw = [] } = useQuery<BackendArticle[]>({
    queryKey: ["articles"],
    queryFn: async () => { const r = await apiClient.get<any>("/articles"); return r.data ?? r ?? []; },
    staleTime: 1000 * 60 * 5,
  });

  // Mutations
  const createSimulation = useCreateSimulation();
  const genererPDF = useGenererPDFDevis();

  // Calculs automatiques
  const TVA_RATE = 0.18;
  const totaux = calculerTotalSimulation(lignesProduits, tvaActive ? TVA_RATE : 0, fraisAdditionnels);

  // Convertir la sélection du picker en ProduitSimulation[]
  const handlePickerConfirm = (lines: LigneForm[]) => {
    const newLignes: ProduitSimulation[] = lines.map(line => {
      const a = articlesRaw.find(art => String(art.id) === line.article_id);
      if (!a) return null;
      const existing = lignesProduits.find(l => l.produitId === line.article_id);
      const remise = existing?.remisePercentage ?? 0;
      return {
        produitId: String(a.id),
        produit: { id: String(a.id), nom: a.libelle, reference: a.reference } as any,
        quantite: line.quantite,
        prixUnitaire: a.prix,
        remisePercentage: remise,
        remiseMontant: (a.prix * line.quantite * remise) / 100,
      };
    }).filter(Boolean) as ProduitSimulation[];
    setLignesProduits(newLignes);
  };

  // Convertir lignesProduits → LigneForm[] pour pré-remplir le picker
  const pickerSelected: LigneForm[] = lignesProduits.map(l => ({
    article_id: l.produitId,
    quantite: l.quantite,
  }));

  // Mise à jour remise inline dans le tableau
  const handleUpdateRemise = (index: number, remise: number) => {
    setLignesProduits(prev => prev.map((l, i) => {
      if (i !== index) return l;
      const montantBase = l.prixUnitaire * l.quantite;
      return { ...l, remisePercentage: remise, remiseMontant: (montantBase * remise) / 100 };
    }));
  };

  const handleRemoveProduit = (index: number) => {
    setLignesProduits(prev => prev.filter((_, i) => i !== index));
  };

  // Sauvegarder comme brouillon
  const handleSaveBrouillon = async () => {
    if (lignesProduits.length === 0) {
      toast({ title: "Erreur", description: "Veuillez ajouter au moins un produit", variant: "destructive" });
      return;
    }
    try {
      const result = await createSimulation.mutateAsync({
        produits: lignesProduits,
        fraisAdditionnels,
        validiteJours,
        notes,
        tvaActive,
      });
      if (result.success) {
        toast({ title: "Devis sauvegardé", description: `Référence: ${result.data?.reference}` });
        setLignesProduits([]);
        setFraisAdditionnels(0);
        setNotes("");
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le devis", variant: "destructive" });
    }
  };

  // Générer PDF
  const handleGenererPDF = async () => {
    if (lignesProduits.length === 0) {
      toast({ title: "Erreur", description: "Veuillez ajouter au moins un produit", variant: "destructive" });
      return;
    }
    try {
      const simResult = await createSimulation.mutateAsync({
        produits: lignesProduits,
        fraisAdditionnels,
        validiteJours,
        notes,
        tvaActive,
      });
      if (simResult.success && simResult.data) {
        const pdfResult = await genererPDF.mutateAsync(simResult.data.id);
        if (pdfResult.success) {
          toast({ title: "PDF généré", description: "Le devis PDF est prêt au téléchargement" });
          window.open(pdfResult.data?.url, '_blank');
        }
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de générer le PDF", variant: "destructive" });
    }
  };

  return (
    <>
      {/* Sheet de sélection produits */}
      <ProductPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        articles={articlesRaw}
        selected={pickerSelected}
        onConfirm={handlePickerConfirm}
      />

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
              <Button onClick={() => setPickerOpen(true)}>
                <Package className="mr-2 h-4 w-4" />
                Sélectionner des produits
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lignesProduits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun produit ajouté</p>
                <p className="text-sm">Cliquez sur "Sélectionner des produits" pour ouvrir le catalogue</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Qté</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Remise (%)</TableHead>
                    <TableHead>Total HT</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignesProduits.map((ligne, index) => {
                    const totalApresRemise = ligne.prixUnitaire * ligne.quantite - ligne.remiseMontant;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ligne.produit?.nom}</div>
                            <div className="text-sm text-muted-foreground">{ligne.produit?.reference}</div>
                          </div>
                        </TableCell>
                        <TableCell>{ligne.quantite}</TableCell>
                        <TableCell>{formatCurrency(ligne.prixUnitaire)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={ligne.remisePercentage}
                              onChange={(e) => handleUpdateRemise(index, Number(e.target.value))}
                              className="w-16 h-7 text-xs px-2"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                            {ligne.remisePercentage > 0 && (
                              <span className="text-xs text-orange-600">
                                -{formatCurrency(ligne.remiseMontant)}
                              </span>
                            )}
                          </div>
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
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">TVA (18%)</Label>
                  <p className="text-xs text-muted-foreground">Appliquer la taxe sur la valeur ajoutée</p>
                </div>
                <Switch checked={tvaActive} onCheckedChange={setTvaActive} />
              </div>

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

                {tvaActive && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVA (18%):</span>
                    <span className="font-medium">{formatCurrency(totaux.taxe)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">
                      {tvaActive ? "Total TTC:" : "Total HT:"}
                    </span>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default SimulationPage;
