import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2, Search, Plus, RefreshCcw, MoreVertical, Edit, Trash2, Phone, Mail, MapPin,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/modules/commercial/services/apiClient";

interface Fournisseur {
  id: number;
  nomComplet: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
}

const EMPTY: Partial<Fournisseur> = { nomComplet: "", telephone: "", email: "", adresse: "" };

export default function FournisseursPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [open, setOpen]             = useState(false);
  const [editItem, setEditItem]     = useState<Fournisseur | null>(null);
  const [form, setForm]             = useState<Partial<Fournisseur>>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDelete]   = useState<Fournisseur | null>(null);

  const { data = [], isLoading, refetch } = useQuery<Fournisseur[]>({
    queryKey: ["fournisseurs"],
    queryFn: async () => {
      const r = await apiClient.get<any>("/fournisseurs", { per_page: 200 });
      return r.data ?? r ?? [];
    },
    staleTime: 0,
  });

  const filtered = data.filter((f) =>
    (f.nomComplet || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.telephone || "").includes(search) ||
    (f.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setOpen(true); };
  const openEdit   = (f: Fournisseur) => { setEditItem(f); setForm({ ...f }); setOpen(true); };

  const handleSave = async () => {
    if (!form.nomComplet?.trim()) {
      toast({ title: "Nom requis", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await apiClient.put(`/fournisseurs/${editItem.id}`, { nom_complet: form.nomComplet, ...form });
      } else {
        await apiClient.post("/fournisseurs", { nom_complet: form.nomComplet, ...form });
      }
      toast({ title: editItem ? "Fournisseur modifié" : "Fournisseur créé" });
      qc.invalidateQueries({ queryKey: ["fournisseurs"] });
      qc.invalidateQueries({ queryKey: ["fournisseurs-list"] });
      setOpen(false);
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/fournisseurs/${deleteTarget.id}`);
      toast({ title: "Fournisseur supprimé" });
      qc.invalidateQueries({ queryKey: ["fournisseurs"] });
      qc.invalidateQueries({ queryKey: ["fournisseurs-list"] });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setDelete(null);
    }
  };

  return (
    <>
      {/* Dialog create/edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { key: "nomComplet", label: "Nom complet *", placeholder: "Ex: Cheikh Electro SARL" },
              { key: "telephone",  label: "Téléphone",     placeholder: "33 XXX XX XX" },
              { key: "email",      label: "Email",         placeholder: "contact@..." },
              { key: "adresse",    label: "Adresse",       placeholder: "Zone industrielle..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input
                  className="mt-1"
                  placeholder={placeholder}
                  value={(form as any)[key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {editItem ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce fournisseur ?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{deleteTarget?.nomComplet}</span> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Page */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-500" /> Fournisseurs
            </h1>
            <p className="text-muted-foreground mt-1">Annuaire des fournisseurs ({data.length})</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Actualiser
            </Button>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Nouveau</Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Chargement…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      Aucun fournisseur
                    </TableCell>
                  </TableRow>
                ) : filtered.map((f) => (
                  <TableRow key={f.id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold">{f.nomComplet}</TableCell>
                    <TableCell>
                      {f.telephone
                        ? <span className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{f.telephone}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {f.email
                        ? <span className="flex items-center gap-1 text-sm"><Mail className="h-3 w-3" />{f.email}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {f.adresse
                        ? <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{f.adresse}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(f)}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDelete(f)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
