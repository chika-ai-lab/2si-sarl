import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Printer, FileText, CheckCircle, Info } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FactureDocument, type FactureData } from "./FacturePDF";
import { apiClient } from "../services/apiClient";
import { toast } from "@/hooks/use-toast";

interface FactureDialogProps {
  commandeId: number;
  commandeRef: string;
  open: boolean;
  onClose: () => void;
}

type Step = "confirm" | "loading" | "done";

export function FactureDialog({ commandeId, commandeRef, open, onClose }: FactureDialogProps) {
  const [step, setStep]           = useState<Step>("confirm");
  const [factureData, setFactureData] = useState<FactureData | null>(null);
  const [wasCreated, setWasCreated]   = useState(false);

  const handleGenerer = async () => {
    setStep("loading");
    try {
      const data = await apiClient.post<FactureData & { created: boolean }>(`/leads/${commandeId}/facture`);
      setWasCreated(data.created);
      setFactureData(data);
      setStep("done");
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      const description = msg.includes("403") || msg.toLowerCase().includes("forbidden")
        ? "Accès refusé — votre compte n'a pas la permission de générer des factures. Contactez l'administrateur."
        : msg || "Une erreur est survenue.";
      toast({ title: "Erreur", description, variant: "destructive" });
      setStep("confirm");
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setFactureData(null);
    onClose();
  };

  const filename = factureData
    ? `Facture-${commandeRef}-${factureData.reference}.pdf`
    : `Facture-${commandeRef}.pdf`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Facture — {commandeRef}
          </DialogTitle>
        </DialogHeader>

        {/* ── Étape 1 : confirmation ── */}
        {step === "confirm" && (
          <>
            <div className="py-4 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Générer la facture ?</p>
                  <p>La facture sera enregistrée et accessible depuis la page <strong>Factures</strong>. Vous pourrez l'imprimer ou la télécharger à tout moment.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Annuler</Button>
              <Button onClick={handleGenerer}>
                <FileText className="mr-2 h-4 w-4" />
                Générer
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Étape 2 : chargement ── */}
        {step === "loading" && (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <Loader2 className="h-20 w-20 text-primary/20 animate-spin absolute -inset-2" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Enregistrement en cours…</p>
              <p className="text-sm text-muted-foreground mt-1">Création de la facture dans le système</p>
            </div>
          </div>
        )}

        {/* ── Étape 3 : succès ── */}
        {step === "done" && factureData && (
          <>
            <div className="py-4 space-y-4">
              {/* Statut */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${wasCreated ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
                <CheckCircle className={`h-5 w-5 shrink-0 ${wasCreated ? "text-green-600" : "text-blue-600"}`} />
                <div>
                  <p className={`text-sm font-semibold ${wasCreated ? "text-green-700" : "text-blue-700"}`}>
                    {wasCreated ? "Facture créée avec succès" : "Facture déjà existante"}
                  </p>
                  <p className={`text-xs mt-0.5 ${wasCreated ? "text-green-600" : "text-blue-600"}`}>
                    {factureData.reference} · {new Date(factureData.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              {/* Info page factures */}
              {wasCreated && (
                <p className="text-xs text-muted-foreground text-center">
                  Retrouvez cette facture à tout moment dans la page <strong>Factures</strong>.
                </p>
              )}

              {/* Actions immédiates */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Voulez-vous faire quelque chose maintenant ?</p>
                <div className="flex gap-2">
                  <PDFDownloadLink
                    document={<FactureDocument data={factureData} />}
                    fileName={filename}
                    className="flex-1"
                  >
                    {({ loading }) => (
                      <Button variant="outline" className="w-full" disabled={loading}>
                        {loading
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Download className="mr-2 h-4 w-4" />}
                        Télécharger le PDF
                      </Button>
                    )}
                  </PDFDownloadLink>
                  <PDFDownloadLink
                    document={<FactureDocument data={factureData} />}
                    fileName={filename}
                    className="flex-1"
                  >
                    {({ url, loading }) => (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={loading || !url}
                        onClick={(e) => {
                          e.preventDefault();
                          if (url) {
                            const win = window.open(url, "_blank");
                            win?.focus();
                            setTimeout(() => win?.print(), 500);
                          }
                        }}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimer
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Fermer — je le ferai plus tard
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
