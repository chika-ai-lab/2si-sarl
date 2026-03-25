import { useState, useEffect } from "react";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Warehouse, Search, AlertTriangle, Package, TrendingDown, TrendingUp,
  Plus, Minus, RefreshCw, Loader2, Edit, Trash2, PackagePlus, MoreVertical,
} from "lucide-react";
import { ImageUrlInput } from "@/components/ui/ImageUrlInput";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

type StockStatut = "normal" | "alerte" | "rupture" | "surstock";

interface StockItem {
  id: string;
  reference: string;
  nom: string;
  marque: string;
  description: string;
  categorie: string;
  categorie_id: number | null;
  quantite: number;
  seuilAlerte: number;
  seuilSurstock: number;
  prixVente: number;
  prixAchat: number;
  statut: "actif" | "inactif" | "rupture";
  banque: string;
  derniereModification: string;
}

interface Categorie {
  id: number;
  categorie: string;
}

function getStatut(item: StockItem): StockStatut {
  if (item.quantite === 0) return "rupture";
  if (item.quantite <= item.seuilAlerte) return "alerte";
  if (item.quantite >= item.seuilSurstock) return "surstock";
  return "normal";
}

const STATUT_CONFIG: Record<StockStatut, { label: string; color: string; icon: React.ElementType }> = {
  normal:   { label: "Normal",   color: "bg-green-100 text-green-800",   icon: Package },
  alerte:   { label: "Alerte",   color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  rupture:  { label: "Rupture",  color: "bg-red-100 text-red-800",       icon: TrendingDown },
  surstock: { label: "Surstock", color: "bg-blue-100 text-blue-800",     icon: TrendingUp },
};

const EMPTY_FORM = {
  libelle: "",
  reference: "",
  marque: "",
  description: "",
  prix_achat: "",
  quantite: "",
  seuil_alerte: "",
  statut: "actif" as "actif" | "inactif" | "rupture",
  banque: "",
  categorie_id: "" as number | "",
  images: [] as string[],
  imageInput: "",
};

interface StockItemWithImages extends StockItem {
  images: string[];
}

function mapItem(item: any): StockItem & { images: string[] } {
  const seuilAlerte = Number(item.seuil_alerte) || 5;
  return {
    id: String(item.id),
    reference: item.reference ?? "",
    nom: item.libelle ?? "",
    marque: item.marque ?? "",
    description: item.description ?? "",
    categorie: item.categorie?.categorie ?? "—",
    categorie_id: item.categorie_id ?? null,
    quantite: Number(item.quantite) || 0,
    seuilAlerte,
    seuilSurstock: seuilAlerte * 5,
    prixVente: Number(item.prix) || 0,
    prixAchat: Number(item.prix_achat) || 0,
    statut: item.statut ?? "actif",
    banque: item.banque ?? "",
    images: Array.isArray(item.images) ? item.images : [],
    derniereModification: item.updated_at?.slice(0, 10) ?? item.created_at?.slice(0, 10) ?? "",
  };
}

export function InventoryPage() {
  const [stock, setStock]       = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [statutFilter, setStatutFilter] = useState<StockStatut | "all">("all");

  // Ajustement
  const [isAjustOpen, setIsAjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [ajustQty, setAjustQty]   = useState("");
  const [ajustType, setAjustType] = useState<"entree" | "sortie">("entree");

  // CRUD
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        apiClient.get<any>("/articles"),
        apiClient.get<any>("/categories"),
      ]);
      const items: any[] = artRes.data ?? artRes ?? [];
      setStock(items.map(mapItem));
      setCategories(catRes.data ?? catRes ?? []);
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur de chargement", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = stock.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.nom.toLowerCase().includes(q) || s.reference.toLowerCase().includes(q) || s.marque.toLowerCase().includes(q);
    const matchStatut = statutFilter === "all" || getStatut(s) === statutFilter;
    return matchSearch && matchStatut;
  });

  const stats = {
    total:   stock.length,
    alerte:  stock.filter((s) => getStatut(s) === "alerte").length,
    rupture: stock.filter((s) => getStatut(s) === "rupture").length,
    valeur:  stock.reduce((sum, s) => sum + s.quantite * s.prixVente, 0),
  };

  // ── CRUD ──────────────────────────────────────────
  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({
      libelle: item.nom,
      reference: item.reference,
      marque: item.marque,
      description: item.description,
      prix_achat: String(item.prixAchat),
      quantite: String(item.quantite),
      seuil_alerte: String(item.seuilAlerte),
      statut: item.statut,
      banque: item.banque,
      categorie_id: item.categorie_id ?? "",
      images: item.images ?? [],
      imageInput: "",
    });
    setIsFormOpen(true);
  };

  const setField = (key: keyof typeof EMPTY_FORM, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.libelle.trim()) {
      toast({ title: "Le nom du produit est requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      libelle: form.libelle,
      reference: form.reference || null,
      marque: form.marque || null,
      description: form.description || null,
      prix_achat: Number(form.prix_achat) || null,
      quantite: Number(form.quantite) || 0,
      seuil_alerte: Number(form.seuil_alerte) || null,
      statut: form.statut,
      banque: form.banque || null,
      categorie_id: form.categorie_id || null,
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

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/articles/${id}`);
      setStock((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmId(null);
      toast({ title: "Produit supprimé" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    }
  };

  // ── Ajustement ────────────────────────────────────
  const openAjust = (item: StockItem) => {
    setSelectedItem(item);
    setAjustQty("");
    setAjustType("entree");
    setIsAjustOpen(true);
  };

  const handleAjust = async () => {
    const qty = parseInt(ajustQty);
    if (!qty || qty <= 0 || !selectedItem) {
      toast({ title: "Quantité invalide", variant: "destructive" });
      return;
    }
    const delta = ajustType === "entree" ? qty : -qty;
    const newQty = Math.max(0, selectedItem.quantite + delta);
    setStock((prev) =>
      prev.map((s) =>
        s.id !== selectedItem.id ? s
          : { ...s, quantite: newQty, derniereModification: new Date().toISOString().slice(0, 10) }
      )
    );
    try {
      await apiClient.patch(`/articles/${selectedItem.id}`, { quantite: newQty });
    } catch (err) { console.error(err); }
    toast({
      title: ajustType === "entree" ? `+${qty} unités ajoutées` : `-${qty} unités sorties`,
      description: selectedItem.nom,
    });
    setIsAjustOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

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

      {/* Create / Edit dialog — formulaire complet */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-2 gap-4">
              {/* Nom */}
              <div className="col-span-2">
                <Label>Nom (libellé) *</Label>
                <Input className="mt-1" value={form.libelle} onChange={(e) => setField("libelle", e.target.value)} placeholder="Nom du produit" />
              </div>
              {/* Référence */}
              <div>
                <Label>Référence</Label>
                <Input className="mt-1" value={form.reference} onChange={(e) => setField("reference", e.target.value)} placeholder="REF-001" />
              </div>
              {/* Marque */}
              <div>
                <Label>Marque</Label>
                <Input className="mt-1" value={form.marque} onChange={(e) => setField("marque", e.target.value)} placeholder="Ex: HP, Dell, Samsung..." />
              </div>
              {/* Description */}
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea className="mt-1" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Description du produit..." rows={2} />
              </div>
              {/* Prix achat */}
              <div>
                <Label>Prix d'achat (FCFA)</Label>
                <Input className="mt-1" type="number" min="0" value={form.prix_achat} onChange={(e) => setField("prix_achat", e.target.value)} placeholder="0" />
              </div>
              {/* Quantité */}
              <div>
                <Label>Quantité en stock</Label>
                <Input className="mt-1" type="number" min="0" value={form.quantite} onChange={(e) => setField("quantite", e.target.value)} placeholder="0" />
              </div>
              {/* Seuil alerte */}
              <div>
                <Label>Seuil d'alerte stock</Label>
                <Input className="mt-1" type="number" min="0" value={form.seuil_alerte} onChange={(e) => setField("seuil_alerte", e.target.value)} placeholder="5" />
              </div>
              {/* Catégorie */}
              <div>
                <Label>Catégorie</Label>
                <Select value={form.categorie_id ? String(form.categorie_id) : "none"} onValueChange={(v) => setField("categorie_id", v === "none" ? "" : Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Aucune —</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.categorie}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Banque */}
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
              {/* Statut */}
              <div className="col-span-2">
                <Label>Statut</Label>
                <Select value={form.statut} onValueChange={(v) => setField("statut", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif (en stock)</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="rupture">Rupture de stock</SelectItem>
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

      {/* Ajustement de stock */}
      <Dialog open={isAjustOpen} onOpenChange={setIsAjustOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajustement de stock</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium">{selectedItem.nom}</p>
                <p className="text-muted-foreground">
                  Stock actuel : <span className="font-semibold">{selectedItem.quantite} unités</span>
                </p>
              </div>
              <div>
                <Label>Type de mouvement</Label>
                <Select value={ajustType} onValueChange={(v) => setAjustType(v as "entree" | "sortie")}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">Entrée de stock</SelectItem>
                    <SelectItem value="sortie">Sortie de stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantité</Label>
                <Input type="number" min="1" className="mt-1" value={ajustQty} onChange={(e) => setAjustQty(e.target.value)} placeholder="Ex: 10" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAjustOpen(false)}>Annuler</Button>
            <Button
              onClick={handleAjust}
              className={ajustType === "entree" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {ajustType === "entree"
                ? <><Plus className="mr-1 h-4 w-4" />Entrée</>
                : <><Minus className="mr-1 h-4 w-4" />Sortie</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Warehouse className="h-7 w-7" /> Inventaire
            </h2>
            <p className="text-muted-foreground">Suivi et gestion des stocks</p>
          </div>
          <Button onClick={openCreate}>
            <PackagePlus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Références</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className={stats.alerte > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">En alerte</p>
              <p className={`text-3xl font-bold ${stats.alerte > 0 ? "text-yellow-600" : ""}`}>{stats.alerte}</p>
            </CardContent>
          </Card>
          <Card className={stats.rupture > 0 ? "border-red-200 bg-red-50/50" : ""}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">En rupture</p>
              <p className={`text-3xl font-bold ${stats.rupture > 0 ? "text-red-600" : ""}`}>{stats.rupture}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Valeur stock</p>
              <p className="text-xl font-bold">{formatCurrency(stats.valeur)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher (nom, référence, marque)..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v as StockStatut | "all")}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alerte">Alerte</SelectItem>
                  <SelectItem value="rupture">Rupture</SelectItem>
                  <SelectItem value="surstock">Surstock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>{filtered.length} référence(s)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Seuil</TableHead>
                  <TableHead className="text-right">Prix vente</TableHead>
                  <TableHead className="text-right">Valeur stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : filtered.map((item) => {
                  const statut = getStatut(item);
                  const cfg = STATUT_CONFIG[statut];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="p-2">
                        {(item as any).images?.length > 0 ? (
                          <img
                            src={(item as any).images[0]}
                            alt={item.nom}
                            className="h-10 w-10 rounded object-cover border"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{item.nom}</p>
                        <p className="text-xs font-mono text-muted-foreground">{item.reference || "—"}</p>
                        {item.marque && <p className="text-xs text-muted-foreground">{item.marque}</p>}
                      </TableCell>
                      <TableCell className="text-sm">{item.categorie}</TableCell>
                      <TableCell className="text-sm">{item.banque || "—"}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-lg ${statut === "rupture" ? "text-red-600" : statut === "alerte" ? "text-yellow-600" : ""}`}>
                          {item.quantite}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{item.seuilAlerte}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.prixVente)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.quantite * item.prixVente)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cfg.color}>
                          <Icon className="mr-1 h-3 w-3" />{cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openAjust(item)}>
                              <RefreshCw className="mr-2 h-4 w-4" />Ajuster stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteConfirmId(item.id)}
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
      </div>
    </>
  );
}

export default InventoryPage;
