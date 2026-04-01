import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search, MoreVertical, Eye, Package, Plus, Edit, Trash2, Loader2,
  RefreshCcw, FolderOpen, FolderPlus, ChevronRight, ArrowLeft,
} from "lucide-react";
import { ImageUrlInput } from "@/components/ui/ImageUrlInput";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { toast } from "@/hooks/use-toast";
import type { BanquePartenaire } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Categorie {
  id: number;
  nom: string;
  description?: string;
  couleur: string;
  icone: string;
  nombreProduits: number;
}

interface BackendArticle {
  id: number;
  libelle: string;
  reference?: string;
  description?: string;
  marque?: string;
  prix: number;
  prix_achat?: number;
  quantite: number;
  seuil_alerte?: number;
  statut?: "actif" | "inactif" | "rupture";
  banque?: string;
  categorie_id?: number;
  categorie?: { id: number; categorie: string };
  categories?: number[];
  images?: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COULEURS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

const EMPTY_ARTICLE_FORM = {
  libelle: "", reference: "", description: "", marque: "",
  prix_achat: "", quantite: "", seuil_alerte: "",
  statut: "actif" as "actif" | "inactif" | "rupture",
  banque: "" as BanquePartenaire | "",
  categories_ids: [] as number[],
  images: [] as string[],
  imageInput: "",
};

const EMPTY_CAT_FORM = { nom: "", description: "", couleur: COULEURS[0], icone: "📁" };

const STATUS_CONFIG = {
  actif:   { label: "En stock", color: "bg-green-100 text-green-800" },
  inactif: { label: "Inactif",  color: "bg-gray-100 text-gray-800" },
  rupture: { label: "Rupture",  color: "bg-red-100 text-red-800" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CataloguePage() {
  const qc = useQueryClient();

  // View state
  const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(null);

  // ── Categories query ──
  const { data: categoriesData } = useQuery({
    queryKey: ['catalogue-categories'],
    queryFn: async (): Promise<Categorie[]> => {
      const res = await apiClient.get<any>('/categories');
      const items: any[] = res.data ?? res ?? [];
      return items.map((item: any, index: number) => ({
        id: Number(item.id),
        nom: item.categorie,
        description: "",
        couleur: COULEURS[index % COULEURS.length],
        icone: "📁",
        nombreProduits: item.articles_count ?? 0,
      }));
    },
  });
  const categories = categoriesData ?? [];

  // ── Articles query (per-category, cached separately) ──
  const { data: articlesData } = useQuery({
    queryKey: ['catalogue-articles', selectedCategory?.id],
    queryFn: async (): Promise<BackendArticle[]> => {
      const res = await apiClient.get<any>('/articles', { categorie_id: selectedCategory!.id });
      return res.data ?? res ?? [];
    },
    enabled: !!selectedCategory,
  });
  const articles = articlesData ?? [];

  // ── Category CRUD state ──
  const [catFormOpen, setCatFormOpen]       = useState(false);
  const [catDeleteTarget, setCatDeleteTarget] = useState<number | null>(null);
  const [catEditId, setCatEditId]           = useState<number | null>(null);
  const [catForm, setCatForm]               = useState(EMPTY_CAT_FORM);
  const [catSearch, setCatSearch]           = useState("");

  // ── Article CRUD state ──
  const [saving, setSaving]                   = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");
  const [statutFilter, setStatutFilter]       = useState<string>("all");
  const [activeTab, setActiveTab]             = useState<"tous" | "cbao" | "cms">("tous");
  const [selectedProduit, setSelectedProduit] = useState<BackendArticle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen]     = useState(false);
  const [isFormOpen, setIsFormOpen]           = useState(false);
  const [editId, setEditId]                   = useState<number | null>(null);
  const [form, setForm]                       = useState({ ...EMPTY_ARTICLE_FORM });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // ── Category handlers ──
  const openCatCreate = () => { setCatEditId(null); setCatForm(EMPTY_CAT_FORM); setCatFormOpen(true); };
  const openCatEdit = (cat: Categorie) => {
    setCatEditId(cat.id);
    setCatForm({ nom: cat.nom, description: cat.description ?? "", couleur: cat.couleur, icone: cat.icone });
    setCatFormOpen(true);
  };

  const handleCatSave = async () => {
    if (!catForm.nom.trim()) {
      toast({ title: "Nom requis", variant: "destructive" });
      return;
    }
    try {
      if (catEditId !== null) {
        await apiClient.put(`/categories/${catEditId}`, { categorie: catForm.nom });
        qc.setQueryData<Categorie[]>(['catalogue-categories'], (old = []) =>
          old.map((c) => c.id === catEditId
            ? { ...c, nom: catForm.nom, description: catForm.description, couleur: catForm.couleur, icone: catForm.icone }
            : c
          )
        );
        toast({ title: "Catégorie modifiée" });
      } else {
        await apiClient.post('/categories', { categorie: catForm.nom });
        qc.invalidateQueries({ queryKey: ['catalogue-categories'] });
        toast({ title: "Catégorie créée" });
      }
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
    setCatFormOpen(false);
  };

  const handleCatDelete = async () => {
    if (catDeleteTarget === null) return;
    const target = catDeleteTarget;
    qc.setQueryData<Categorie[]>(['catalogue-categories'], (old = []) => old.filter((c) => c.id !== target));
    setCatDeleteTarget(null);
    try {
      await apiClient.delete(`/categories/${target}`);
      toast({ title: "Catégorie supprimée" });
    } catch {
      qc.invalidateQueries({ queryKey: ['catalogue-categories'] });
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  // ── Article handlers ──
  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_ARTICLE_FORM, categories_ids: selectedCategory ? [selectedCategory.id] : [] });
    setIsFormOpen(true);
  };

  const openEdit = (a: BackendArticle) => {
    setEditId(a.id);
    setForm({
      libelle: a.libelle,
      reference: a.reference ?? "",
      description: a.description ?? "",
      marque: a.marque ?? "",
      prix_achat: String(a.prix_achat ?? ""),
      quantite: String(a.quantite),
      seuil_alerte: String(a.seuil_alerte ?? ""),
      statut: a.statut ?? "actif",
      banque: (a.banque as BanquePartenaire) ?? "",
      categories_ids: Array.isArray(a.categories) ? a.categories : (a.categorie_id ? [a.categorie_id] : []),
      images: Array.isArray(a.images) ? a.images : [],
      imageInput: "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.libelle.trim()) {
      toast({ title: "Le nom du produit est requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      libelle: form.libelle,
      reference: form.reference || null,
      description: form.description || null,
      marque: form.marque || null,
      prix_achat: Number(form.prix_achat) || null,
      quantite: Number(form.quantite) || 0,
      seuil_alerte: Number(form.seuil_alerte) || null,
      statut: form.statut,
      banque: form.banque || null,
      categorie_id: form.categories_ids[0] || null,
      categories_ids: form.categories_ids,
      images: form.images.length > 0 ? form.images : null,
    };
    try {
      if (editId) {
        await apiClient.put(`/articles/${editId}`, payload);
        toast({ title: "Produit modifié avec succès" });
      } else {
        await apiClient.post("/articles", payload);
        toast({ title: "Produit créé avec succès" });
      }
      setIsFormOpen(false);
      qc.invalidateQueries({ queryKey: ['catalogue-articles', selectedCategory?.id] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    qc.setQueryData<BackendArticle[]>(['catalogue-articles', selectedCategory?.id], (old = []) =>
      old.filter((a) => a.id !== id)
    );
    setDeleteConfirmId(null);
    try {
      await apiClient.delete(`/articles/${id}`);
      toast({ title: "Produit supprimé" });
    } catch {
      qc.invalidateQueries({ queryKey: ['catalogue-articles', selectedCategory?.id] });
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const setField = (key: keyof typeof EMPTY_ARTICLE_FORM, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  // ── Derived data ──
  const filtered = articles.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || a.libelle.toLowerCase().includes(q) || (a.reference ?? "").toLowerCase().includes(q);
    const matchStatut = statutFilter === "all" || (a.statut ?? "actif") === statutFilter;
    const banque = (a.banque ?? "").toUpperCase();
    const matchBanque =
      activeTab === "tous" ||
      (activeTab === "cbao" && banque === "CBAO") ||
      (activeTab === "cms" && banque === "CMS");
    return matchSearch && matchStatut && matchBanque;
  });

  const filteredCats = categories.filter((c) =>
    !catSearch || c.nom.toLowerCase().includes(catSearch.toLowerCase())
  );
  const totalProduits = categories.reduce((sum, c) => sum + c.nombreProduits, 0);

  // ════════════════════════════════════════════════════════════════
  // VIEW 2 — Products of selected category
  // ════════════════════════════════════════════════════════════════
  if (selectedCategory) {
    const loadingArticles = articlesData === undefined;

    return (
      <>
        {/* Delete article confirm */}
        <AlertDialog open={deleteConfirmId !== null} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}
              >Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create / Edit article */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editId ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nom *</Label>
                  <Input className="mt-1" value={form.libelle} onChange={(e) => setField("libelle", e.target.value)} placeholder="Nom du produit" />
                </div>
                <div>
                  <Label>Référence</Label>
                  <Input className="mt-1" value={form.reference} onChange={(e) => setField("reference", e.target.value)} placeholder="REF-001" />
                </div>
                <div>
                  <Label>Marque</Label>
                  <Input className="mt-1" value={form.marque} onChange={(e) => setField("marque", e.target.value)} placeholder="Ex: HP, Dell..." />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea className="mt-1" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Description du produit..." rows={2} />
                </div>
                <div>
                  <Label>Prix d'achat (FCFA)</Label>
                  <Input className="mt-1" type="number" min="0" value={form.prix_achat} onChange={(e) => setField("prix_achat", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>Quantité en stock</Label>
                  <Input className="mt-1" type="number" min="0" value={form.quantite} onChange={(e) => setField("quantite", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>Seuil d'alerte</Label>
                  <Input className="mt-1" type="number" min="0" value={form.seuil_alerte} onChange={(e) => setField("seuil_alerte", e.target.value)} placeholder="5" />
                </div>
                <div className="col-span-2">
                  <Label>Catégories</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 border rounded-md p-3">
                    {categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={form.categories_ids.includes(c.id)}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              categories_ids: e.target.checked
                                ? [...prev.categories_ids, c.id]
                                : prev.categories_ids.filter((id) => id !== c.id),
                            }));
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        {c.nom}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Banque partenaire</Label>
                  <Select value={form.banque || "none"} onValueChange={(v) => setField("banque", v === "none" ? "" : v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Aucune —</SelectItem>
                      <SelectItem value="CBAO">CBAO</SelectItem>
                      <SelectItem value="CMS">CMS</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={form.statut} onValueChange={(v) => setField("statut", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">En stock</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                      <SelectItem value="rupture">Rupture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <ImageUrlInput images={form.images} onChange={(imgs) => setField("images", imgs)} />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editId ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selectedProduit?.libelle}</DialogTitle></DialogHeader>
            {selectedProduit && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Référence</p><p className="font-mono font-semibold">{selectedProduit.reference || "—"}</p></div>
                  <div><p className="text-muted-foreground">Marque</p><p className="font-semibold">{selectedProduit.marque || "—"}</p></div>
                  <div>
                    <p className="text-muted-foreground">Catégorie</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProduit.categorie && <Badge variant="outline">{selectedProduit.categorie.categorie}</Badge>}
                    </div>
                  </div>
                  <div><p className="text-muted-foreground">Banque</p><Badge variant="outline">{selectedProduit.banque || "—"}</Badge></div>
                </div>
                {selectedProduit.description && (
                  <div><p className="text-muted-foreground">Description</p><p>{selectedProduit.description}</p></div>
                )}
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted rounded-lg">
                  <div><p className="text-muted-foreground">Prix achat</p><p className="font-semibold">{formatCurrency(Number(selectedProduit.prix_achat) || 0)}</p></div>
                  <div><p className="text-muted-foreground">Prix vente</p><p className="font-semibold text-base">{formatCurrency(Number(selectedProduit.prix) || 0)}</p></div>
                  <div><p className="text-muted-foreground">Marge</p><p className="font-semibold text-green-600">{formatCurrency((Number(selectedProduit.prix) || 0) - (Number(selectedProduit.prix_achat) || 0))}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-muted-foreground">Stock</p><p className="font-bold text-lg">{selectedProduit.quantite}</p></div>
                  <div><p className="text-muted-foreground">Seuil alerte</p><p className="font-semibold">{selectedProduit.seuil_alerte ?? "—"}</p></div>
                  <div>
                    <p className="text-muted-foreground">Statut</p>
                    <Badge variant="outline" className={(STATUS_CONFIG[selectedProduit.statut ?? "actif"] ?? STATUS_CONFIG.actif).color}>
                      {(STATUS_CONFIG[selectedProduit.statut ?? "actif"] ?? STATUS_CONFIG.actif).label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          {/* Header with breadcrumb */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost" size="sm"
                onClick={() => setSelectedCategory(null)}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Catalogue
              </Button>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedCategory.icone}</span>
                <h2 className="text-2xl font-bold tracking-tight">{selectedCategory.nom}</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => qc.invalidateQueries({ queryKey: ['catalogue-articles', selectedCategory.id] })}
                disabled={loadingArticles}
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${loadingArticles ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau produit
              </Button>
            </div>
          </div>

          {/* Search + status filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit (nom, référence)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="actif">En stock</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="rupture">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs + table */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tous" | "cbao" | "cms")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tous">Tous</TabsTrigger>
              <TabsTrigger value="cbao">CBAO</TabsTrigger>
              <TabsTrigger value="cms">CMS</TabsTrigger>
            </TabsList>
            {(["tous", "cbao", "cms"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <ProductsTable
                  produits={filtered}
                  isLoading={loadingArticles}
                  onViewDetails={(a) => { setSelectedProduit(a); setIsDetailsOpen(true); }}
                  onEdit={openEdit}
                  onDelete={(id) => setDeleteConfirmId(id)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // VIEW 1 — Categories grid
  // ════════════════════════════════════════════════════════════════

  if (categoriesData === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-64" /></div>
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-7 w-10" /></div>
            </CardContent></Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}><CardContent className="p-5 space-y-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-6 w-20" />
            </CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Category dialog */}
      <Dialog open={catFormOpen} onOpenChange={setCatFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{catEditId !== null ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom *</Label>
              <Input value={catForm.nom} onChange={(e) => setCatForm({ ...catForm, nom: e.target.value })} placeholder="Ex: Informatique" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Icône (emoji)</Label>
              <Input value={catForm.icone} onChange={(e) => setCatForm({ ...catForm, icone: e.target.value })} maxLength={4} className="w-20" />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {COULEURS.map((c) => (
                  <button
                    key={c} type="button"
                    className={`w-8 h-8 rounded-full transition-all ${catForm.couleur === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setCatForm({ ...catForm, couleur: c })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatFormOpen(false)}>Annuler</Button>
            <Button onClick={handleCatSave}>{catEditId !== null ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete category confirm */}
      <AlertDialog open={catDeleteTarget !== null} onOpenChange={(o) => !o && setCatDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCatDelete}
            >Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FolderOpen className="h-7 w-7" /> Catalogue
            </h2>
            <p className="text-muted-foreground">Sélectionnez une catégorie pour gérer ses produits</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['catalogue-categories'] })}>
              <RefreshCcw className="mr-2 h-4 w-4" />Actualiser
            </Button>
            <Button onClick={openCatCreate}>
              <FolderPlus className="mr-2 h-4 w-4" />Nouvelle catégorie
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Catégories</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Produits référencés</p>
                <p className="text-3xl font-bold">{totalProduits}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Plus className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Moy. produits / cat.</p>
                <p className="text-3xl font-bold">{categories.length ? (totalProduits / categories.length).toFixed(0) : 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une catégorie..."
            className="pl-9"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
          />
        </div>

        {/* Categories grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCats.map((cat) => (
            <Card
              key={cat.id}
              className="hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: cat.couleur + "20", border: `2px solid ${cat.couleur}40` }}
                  >
                    {cat.icone}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); openCatEdit(cat); }}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); setCatDeleteTarget(cat.id); }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{cat.nom}</h3>
                {cat.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{ backgroundColor: cat.couleur + "20", color: cat.couleur }}
                  >
                    <Package className="h-3 w-3" />
                    {cat.nombreProduits} produits
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add category card */}
          <Card
            className="border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex items-center justify-center min-h-36"
            onClick={() => openCatCreate()}
          >
            <CardContent className="flex flex-col items-center gap-2 text-muted-foreground p-5">
              <Plus className="h-8 w-8" />
              <span className="text-sm">Ajouter une catégorie</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// ─── ProductsTable ────────────────────────────────────────────────────────────

function ProductsTable({
  produits,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
}: {
  produits: BackendArticle[];
  isLoading: boolean;
  onViewDetails: (a: BackendArticle) => void;
  onEdit: (a: BackendArticle) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-3">
            <Skeleton className="h-40 w-full rounded" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent></Card>
        ))}
      </div>
    );
  }
  if (produits.length === 0) {
    return (
      <Card><CardContent className="py-12 text-center text-muted-foreground">
        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>Aucun produit dans cette catégorie</p>
      </CardContent></Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="whitespace-nowrap">Référence</TableHead>
              <TableHead className="whitespace-nowrap">Prix vente</TableHead>
              <TableHead className="whitespace-nowrap">Marge</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produits.map((a) => {
              const statut = a.statut ?? "actif";
              const cfg = STATUS_CONFIG[statut] ?? STATUS_CONFIG.actif;
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium line-clamp-1">{a.libelle}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{a.marque ?? "—"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm whitespace-nowrap">{a.reference ?? "—"}</TableCell>
                  <TableCell className="font-semibold whitespace-nowrap">{formatCurrency(Number(a.prix) || 0)}</TableCell>
                  <TableCell className={`font-semibold text-sm whitespace-nowrap ${(Number(a.prix) || 0) - (Number(a.prix_achat) || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency((Number(a.prix) || 0) - (Number(a.prix_achat) || 0))}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{a.quantite}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(a)}>
                          <Eye className="mr-2 h-4 w-4" />Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(a)}>
                          <Edit className="mr-2 h-4 w-4" />Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(a.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />Supprimer
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
  );
}

export default CataloguePage;
