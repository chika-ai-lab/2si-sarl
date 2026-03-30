import { useState, useEffect } from "react";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FolderOpen, FolderPlus, Search, Plus, Edit, Trash2, ChevronRight, Package, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Categorie {
  id: string;
  nom: string;
  description?: string;
  parentId?: string;
  couleur: string;
  icone: string;
  nombreProduits: number;
  ordre: number;
}

const COULEURS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

const INITIAL_CATEGORIES: Categorie[] = [
  { id: "cat-001", nom: "Informatique",       description: "Ordinateurs, serveurs et accessoires", couleur: "#3B82F6", icone: "💻", nombreProduits: 45, ordre: 1 },
  { id: "cat-002", nom: "Impression",         description: "Imprimantes, scanners et consommables", couleur: "#10B981", icone: "🖨️", nombreProduits: 22, ordre: 2 },
  { id: "cat-003", nom: "Réseau",             description: "Switches, routeurs et câblage",        couleur: "#F59E0B", icone: "🌐", nombreProduits: 18, ordre: 3 },
  { id: "cat-004", nom: "Téléphonie",         description: "Téléphones IP et mobilité",            couleur: "#8B5CF6", icone: "📞", nombreProduits: 12, ordre: 4 },
  { id: "cat-005", nom: "Stockage",           description: "Disques durs, NAS et baies",           couleur: "#EC4899", icone: "💾", nombreProduits: 15, ordre: 5 },
  { id: "cat-006", nom: "Affichage",          description: "Écrans, projecteurs et vidéo",         couleur: "#06B6D4", icone: "🖥️", nombreProduits: 20, ordre: 6 },
  { id: "cat-007", nom: "Alimentation & UPS", description: "Onduleurs, prises et câbles",          couleur: "#EF4444", icone: "🔋", nombreProduits: 8,  ordre: 7 },
  { id: "cat-008", nom: "Logiciels",          description: "Licences et solutions SaaS",           couleur: "#84CC16", icone: "📦", nombreProduits: 30, ordre: 8 },
];

const EMPTY_FORM = { nom: "", description: "", couleur: COULEURS[0], icone: "📁" };

export function CategoriesPage() {
  const [categories, setCategories]   = useState<Categorie[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);

  const fetchCategories = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiClient.get<any>('/categories');
      const items: any[] = res.data ?? res ?? [];
      const mapped: Categorie[] = items.map((item: any, index: number) => ({
        id: String(item.id),
        nom: item.categorie,
        description: "",
        couleur: COULEURS[index % COULEURS.length],
        icone: "📁",
        nombreProduits: 0,
        ordre: index + 1,
      }));
      setCategories(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) =>
    !search || c.nom.toLowerCase().includes(search.toLowerCase())
  );

  const totalProduits = categories.reduce((sum, c) => sum + c.nombreProduits, 0);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setIsDialogOpen(true); };

  const openEdit = (cat: Categorie) => {
    setEditId(cat.id);
    setForm({ nom: cat.nom, description: cat.description ?? "", couleur: cat.couleur, icone: cat.icone });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim()) {
      toast({ title: "Nom requis", variant: "destructive" });
      return;
    }
    try {
      if (editId) {
        await apiClient.put(`/categories/${editId}`, { categorie: form.nom });
        setCategories((prev) => prev.map((c) => c.id === editId ? { ...c, ...form } : c));
        toast({ title: "Catégorie modifiée" });
      } else {
        await apiClient.post('/categories', { categorie: form.nom });
        await fetchCategories(true);
        toast({ title: "Catégorie créée" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/categories/${deleteTarget}`);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget));
      toast({ title: "Catégorie supprimée" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-64" /></div>
          <Skeleton className="h-9 w-40" />
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
      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom *</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Informatique" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Icône (emoji)</Label>
              <Input value={form.icone} onChange={(e) => setForm({ ...form, icone: e.target.value })} maxLength={4} className="w-20" />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {COULEURS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${form.couleur === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm({ ...form, couleur: c })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editId ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FolderOpen className="h-7 w-7" /> Catégories
            </h2>
            <p className="text-muted-foreground">Organisation des produits par catégorie</p>
          </div>
          <Button onClick={openCreate}><FolderPlus className="mr-2 h-4 w-4" />Nouvelle catégorie</Button>
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
                <p className="text-3xl font-bold">{(totalProduits / categories.length).toFixed(0)}</p>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat) => (
            <Card key={cat.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: cat.couleur + "20", border: `2px solid ${cat.couleur}40` }}
                  >
                    {cat.icone}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(cat.id)}>
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

          {/* Add card */}
          <Card
            className="border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex items-center justify-center min-h-36"
            onClick={openCreate}
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

export default CategoriesPage;
