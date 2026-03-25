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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuSeparator,
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
  Package,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { ImageUrlInput } from "@/components/ui/ImageUrlInput";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { toast } from "@/hooks/use-toast";
import type { BanquePartenaire } from "../types";

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
  categories?: number[];  // multi-category ids
  images?: string[];
}

interface Categorie {
  id: number;
  categorie: string;
}

const EMPTY_FORM = {
  libelle: "",
  reference: "",
  description: "",
  marque: "",
  prix_achat: "",
  quantite: "",
  seuil_alerte: "",
  statut: "actif" as "actif" | "inactif" | "rupture",
  banque: "" as BanquePartenaire | "",
  categories_ids: [] as number[],
  images: [] as string[],
  imageInput: "",
};

const STATUS_CONFIG = {
  actif:    { label: "En stock",  color: "bg-green-100 text-green-800" },
  inactif:  { label: "Inactif",  color: "bg-gray-100 text-gray-800" },
  rupture:  { label: "Rupture",  color: "bg-red-100 text-red-800" },
};

export function CataloguePage() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<BackendArticle[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"tous" | "cbao" | "cms">("tous");
  const [selectedProduit, setSelectedProduit] = useState<BackendArticle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        apiClient.get<any>("/articles"),
        apiClient.get<any>("/categories"),
      ]);
      setArticles(artRes.data ?? artRes ?? []);
      setCategories(catRes.data ?? catRes ?? []);
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur de chargement", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filters
  const filtered = articles.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || a.libelle.toLowerCase().includes(q) || (a.reference ?? "").toLowerCase().includes(q);
    const matchCat = categorieFilter === "all" || String(a.categorie_id) === categorieFilter;
    const matchStatut = statutFilter === "all" || (a.statut ?? "actif") === statutFilter;
    const banque = (a.banque ?? "").toUpperCase();
    const matchBanque =
      activeTab === "tous" ||
      (activeTab === "cbao" && banque === "CBAO") ||
      (activeTab === "cms" && banque === "CMS");
    return matchSearch && matchCat && matchStatut && matchBanque;
  });

  // Form handlers
  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
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
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirmId(null);
      toast({ title: "Produit supprimé" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    }
  };

  const setField = (key: keyof typeof EMPTY_FORM, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <>
      {/* Delete confirm */}
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
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Edit dialog */}
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
                      {c.categorie}
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
              {/* Images */}
              <div className="col-span-2">
                <ImageUrlInput
                  images={form.images}
                  onChange={(imgs) => setField("images", imgs)}
                />
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
          <DialogHeader>
            <DialogTitle>{selectedProduit?.libelle}</DialogTitle>
          </DialogHeader>
          {selectedProduit && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Référence</p><p className="font-mono font-semibold">{selectedProduit.reference || "—"}</p></div>
                <div><p className="text-muted-foreground">Marque</p><p className="font-semibold">{selectedProduit.marque || "—"}</p></div>
                <div><p className="text-muted-foreground">Catégories</p>
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
                <div><p className="text-muted-foreground">Prix achat</p><p className="font-semibold">{formatCurrency(selectedProduit.prix_achat ?? 0)}</p></div>
                <div><p className="text-muted-foreground">Prix vente</p><p className="font-semibold text-base">{formatCurrency(selectedProduit.prix)}</p></div>
                <div><p className="text-muted-foreground">Marge</p><p className="font-semibold text-green-600">{formatCurrency(selectedProduit.prix - (selectedProduit.prix_achat ?? 0))}</p></div>
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("admin.products")}</h2>
            <p className="text-muted-foreground">Catalogue des produits par garant financier</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau produit
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit (nom, référence)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select value={categorieFilter} onValueChange={setCategorieFilter}>
                    <SelectTrigger><SelectValue placeholder="Toutes les catégories" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.categorie}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Statut</label>
                  <Select value={statutFilter} onValueChange={setStatutFilter}>
                    <SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="actif">En stock</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                      <SelectItem value="rupture">Rupture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tous" | "cbao" | "cms")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tous">Tous les produits</TabsTrigger>
            <TabsTrigger value="cbao">CBAO</TabsTrigger>
            <TabsTrigger value="cms">CMS</TabsTrigger>
          </TabsList>
          {(["tous", "cbao", "cms"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <ProductsTable
                produits={filtered}
                isLoading={loading}
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
      <Card><CardContent className="py-10 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </CardContent></Card>
    );
  }
  if (produits.length === 0) {
    return (
      <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun produit trouvé</CardContent></Card>
    );
  }
  return (
    <Card>
      <CardHeader><CardTitle>{produits.length} produit(s)</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix vente</TableHead>
              <TableHead>Marge</TableHead>
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
                  <TableCell className="font-mono text-sm">{a.reference ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{a.categorie?.categorie ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(a.prix)}</TableCell>
                  <TableCell className={`font-semibold text-sm ${a.prix - (a.prix_achat ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(a.prix - (a.prix_achat ?? 0))}
                  </TableCell>
                  <TableCell className="text-sm">{a.quantite}</TableCell>
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
