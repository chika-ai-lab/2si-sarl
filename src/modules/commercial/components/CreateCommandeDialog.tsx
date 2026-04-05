import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BookOpen, Loader2, Minus, Package, Plus, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { MODES_PAIEMENT } from "../lib/commandes.constants";
import { ClientPickerSheet } from "./ClientPickerSheet";
import { ProductPickerSheet, type BackendArticle, type LigneForm } from "./ProductPickerSheet";

export function CreateCommandeDialog({ open, onClose, onCreated, articles, clients, editCommandeId }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  articles: BackendArticle[];
  clients: any[];
  editCommandeId?: string;
}) {
  const isEdit = !!editCommandeId;

  const [saving, setSaving]                     = useState(false);
  const [loadingEdit, setLoadingEdit]           = useState(false);
  const [clientId, setClientId]                 = useState("");
  const [modePaiement, setModePaiement]         = useState("virement");
  const [notes, setNotes]                       = useState("");
  const [lignes, setLignes]                     = useState<LigneForm[]>([]);
  const [pickerOpen, setPickerOpen]             = useState(false);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);

  const reset = () => { setClientId(""); setModePaiement("virement"); setNotes(""); setLignes([]); };

  // Pre-fill form when opening in edit mode
  useEffect(() => {
    if (!open || !editCommandeId) return;
    setLoadingEdit(true);
    apiClient.get<any>(`/commande-clients/${editCommandeId}`)
      .then((raw) => {
        const c = raw?.data ?? raw;
        setClientId(String(c.client_id || c.client?.id || ""));
        setModePaiement(c.mode_paiement || "virement");
        setNotes(c.note || c.notes || "");
        const arts: LigneForm[] = (c.articles || []).map((a: any) => ({
          article_id: String(a.article_id || a.id),
          quantite:   Number(a.quantite) || 1,
        }));
        setLignes(arts);
      })
      .catch(() => toast({ title: "Impossible de charger la commande", variant: "destructive" }))
      .finally(() => setLoadingEdit(false));
  }, [open, editCommandeId]);

  const updateQty = (idx: number, delta: number) =>
    setLignes((prev) => {
      const next = [...prev];
      const newQty = next[idx].quantite + delta;
      if (newQty <= 0) return next.filter((_, i) => i !== idx);
      next[idx] = { ...next[idx], quantite: newQty };
      return next;
    });

  const handleCreate = async () => {
    if (!clientId) { toast({ title: "Sélectionnez un client", variant: "destructive" }); return; }
    if (lignes.length === 0) { toast({ title: "Ajoutez au moins un article", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      client_id:     clientId,
      date:          new Date().toISOString().split("T")[0],
      mode_paiement: modePaiement,
      note:          notes || undefined,
      lignes: lignes.map((l) => {
        const art = articles.find((a) => String(a.id) === l.article_id);
        return { article_id: l.article_id, quantite: l.quantite, prix: art?.prix ?? 0, prix_achat: art?.prix_achat ?? 0 };
      }),
    };
    try {
      if (isEdit) {
        await apiClient.put(`/commande-clients/${editCommandeId}`, payload);
        toast({ title: "Commande modifiée avec succès" });
      } else {
        await apiClient.post("/commande-clients", payload);
        toast({ title: "Commande créée avec succès" });
      }
      onCreated();
      onClose();
      reset();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const selectedClient = clients.find((c) => c.id === clientId);
  const total = lignes.reduce((s, l) => {
    const art = articles.find((a) => String(a.id) === l.article_id);
    return s + (art?.prix ?? 0) * l.quantite;
  }, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Modifier la commande" : "Nouvelle commande"}</DialogTitle>
          </DialogHeader>

          {loadingEdit ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}

          <div className={`flex-1 overflow-y-auto space-y-4 pr-1 ${loadingEdit ? "hidden" : ""}`}>
            {/* Client */}
            <div>
              <Label>Client *</Label>
              {selectedClient ? (
                <button type="button" className="mt-1 w-full flex items-center gap-3 border rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors text-left" onClick={() => setClientPickerOpen(true)}>
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {(selectedClient.nom?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{selectedClient.nom}{selectedClient.prenom ? ` ${selectedClient.prenom}` : ""}</p>
                    {selectedClient.telephone && <p className="text-xs text-muted-foreground">{selectedClient.telephone}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">Modifier</span>
                </button>
              ) : (
                <button type="button" className="mt-1 w-full border-2 border-dashed rounded-lg py-6 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex flex-col items-center gap-1.5" onClick={() => setClientPickerOpen(true)}>
                  <UserCheck className="h-6 w-6 opacity-40" />
                  <span className="text-sm">Cliquez pour choisir un client</span>
                </button>
              )}
            </div>

            {/* Mode paiement */}
            <div>
              <Label>Mode de paiement</Label>
              <Select value={modePaiement} onValueChange={setModePaiement}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODES_PAIEMENT.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Remarques..." />
            </div>

            {/* Articles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Articles</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                  <BookOpen className="h-4 w-4 mr-1" />Catalogue
                </Button>
              </div>

              {lignes.length === 0 ? (
                <button type="button" className="w-full border-2 border-dashed rounded-lg py-8 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex flex-col items-center gap-2" onClick={() => setPickerOpen(true)}>
                  <Package className="h-8 w-8 opacity-40" />
                  <span className="text-sm">Cliquez pour choisir des articles</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  {lignes.map((ligne, i) => {
                    const art = articles.find((a) => String(a.id) === ligne.article_id);
                    return (
                      <div key={ligne.article_id} className="flex items-center gap-3 border rounded-lg px-3 py-2">
                        <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                          {art?.images?.[0]
                            ? <img src={art.images[0]} alt={art.libelle} className="h-full w-full object-cover" />
                            : <Package className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{art?.libelle ?? `Article #${ligne.article_id}`}</p>
                          {art?.prix != null && <p className="text-xs text-muted-foreground">{formatCurrency(art.prix)} / unité</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-red-50 transition-colors" onClick={() => updateQty(i, -1)}>
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{ligne.quantite}</span>
                          <button type="button" className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors" onClick={() => updateQty(i, 1)}>
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {art?.prix != null && (
                          <span className="text-sm font-semibold text-primary whitespace-nowrap w-24 text-right shrink-0">
                            {formatCurrency(art.prix * ligne.quantite)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between pt-1">
                    <button type="button" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1" onClick={() => setPickerOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />Modifier la sélection
                    </button>
                    <div className="text-sm font-semibold px-3 py-1.5 bg-muted rounded-lg">
                      Total : {formatCurrency(total)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => { onClose(); reset(); }}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving || loadingEdit}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Créer la commande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ClientPickerSheet
        open={clientPickerOpen}
        onClose={() => setClientPickerOpen(false)}
        clients={clients}
        selectedId={clientId}
        onSelect={setClientId}
      />
      <ProductPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        articles={articles}
        selected={lignes}
        onConfirm={setLignes}
      />
    </>
  );
}
