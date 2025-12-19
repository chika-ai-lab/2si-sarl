import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: any[]) => Promise<void>;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface ParsedProduct {
  name: string;
  description: string;
  reference: string;
  category: string;
  price: number;
  stockQuantity?: number;
  imageUrl: string;
  tags?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export function ProductImportDialog({
  open,
  onOpenChange,
  onImport,
}: ProductImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ParsedProduct[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV (.csv)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    try {
      if (file.type === "text/csv") {
        await parseCSV(file);
      } else {
        await parseExcel(file);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier. Vérifiez le format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = validateAndParseData(results.data);
          setPreviewData(parsed);
          resolve();
        },
        error: () => {
          toast({
            title: "Erreur CSV",
            description: "Erreur lors de la lecture du fichier CSV",
            variant: "destructive",
          });
          resolve();
        },
      });
    });
  };

  const parseExcel = async (file: File): Promise<void> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
    const parsed = validateAndParseData(jsonData);
    setPreviewData(parsed);
  };

  const validateAndParseData = (data: any[]): ParsedProduct[] => {
    const parsed: ParsedProduct[] = [];

    data.forEach((row: any, index: number) => {
      try {
        // Required fields validation
        if (!row.name || !row.description || !row.reference || !row.category || !row.price || !row.imageUrl) {
          console.warn(`Row ${index + 2}: Missing required fields`);
          return;
        }

        const product: ParsedProduct = {
          name: String(row.name).trim(),
          description: String(row.description).trim(),
          reference: String(row.reference).trim(),
          category: String(row.category).toLowerCase().trim(),
          price: parseFloat(row.price),
          stockQuantity: row.stockQuantity ? parseInt(row.stockQuantity) : undefined,
          imageUrl: String(row.imageUrl).trim(),
          tags: row.tags ? String(row.tags).trim() : undefined,
          isNew: row.isNew ? Boolean(row.isNew) : false,
          isBestSeller: row.isBestSeller ? Boolean(row.isBestSeller) : false,
        };

        // Validate price
        if (isNaN(product.price) || product.price < 0) {
          console.warn(`Row ${index + 2}: Invalid price`);
          return;
        }

        // Validate category
        const validCategories = ["electronics", "furniture", "kitchen", "office", "tools"];
        if (!validCategories.includes(product.category)) {
          console.warn(`Row ${index + 2}: Invalid category "${product.category}"`);
          return;
        }

        parsed.push(product);
      } catch (error) {
        console.warn(`Row ${index + 2}: Parsing error`, error);
      }
    });

    return parsed;
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Le fichier ne contient aucun produit valide à importer",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onImport(previewData);

      setImportResult({
        success: previewData.length,
        failed: 0,
        errors: [],
      });

      toast({
        title: "Importation réussie",
        description: `${previewData.length} produit(s) importé(s) avec succès`,
      });

      // Reset after successful import
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: "Exemple Produit",
        description: "Description détaillée du produit",
        reference: "REF-12345",
        category: "electronics",
        price: 599000,
        stockQuantity: 50,
        imageUrl: "https://example.com/image.jpg",
        tags: "tag1, tag2, tag3",
        isNew: true,
        isBestSeller: false,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produits");
    XLSX.writeFile(wb, "template_import_produits.xlsx");

    toast({
      title: "Template téléchargé",
      description: "Utilisez ce fichier comme modèle pour votre importation",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des produits
          </DialogTitle>
          <DialogDescription>
            Importez plusieurs produits en une seule fois via un fichier Excel ou CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Télécharger le modèle
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Utilisez notre modèle Excel pour formater correctement vos données
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le modèle
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <h4 className="font-semibold">Sélectionner un fichier</h4>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Excel (.xlsx, .xls) ou CSV (.csv)
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="flex-1 text-sm font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreviewData([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Preview Data */}
          {previewData.length > 0 && !importResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  Aperçu ({previewData.length} produit(s))
                </h4>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Prêt à importer
                </Badge>
              </div>
              <div className="border rounded-lg max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Nom</th>
                      <th className="text-left p-2 font-medium">Référence</th>
                      <th className="text-left p-2 font-medium">Catégorie</th>
                      <th className="text-right p-2 font-medium">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((product, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2 font-mono text-xs">
                          {product.reference}
                        </td>
                        <td className="p-2 capitalize">{product.category}</td>
                        <td className="p-2 text-right font-semibold">
                          {product.price.toLocaleString()} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground bg-muted/50">
                    ... et {previewData.length - 10} produit(s) de plus
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">
                      Importation terminée
                    </h4>
                    <p className="text-sm text-green-700">
                      {importResult.success} produit(s) importé(s) avec succès
                    </p>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">
                        Erreurs ({importResult.failed})
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>
                            Ligne {error.row}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Format Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <h4 className="font-semibold mb-2">Format requis</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>name</strong>: Nom du produit (requis)</li>
              <li>• <strong>description</strong>: Description détaillée (requis)</li>
              <li>• <strong>reference</strong>: Référence unique (requis)</li>
              <li>• <strong>category</strong>: electronics, furniture, kitchen, office, tools (requis)</li>
              <li>• <strong>price</strong>: Prix en FCFA (requis)</li>
              <li>• <strong>stockQuantity</strong>: Quantité en stock (optionnel)</li>
              <li>• <strong>imageUrl</strong>: URL de l'image (requis)</li>
              <li>• <strong>tags</strong>: Tags séparés par des virgules (optionnel)</li>
              <li>• <strong>isNew</strong>: true/false (optionnel)</li>
              <li>• <strong>isBestSeller</strong>: true/false (optionnel)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {importResult ? "Fermer" : "Annuler"}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={previewData.length === 0 || isProcessing}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importation...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer {previewData.length} produit(s)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
