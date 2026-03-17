import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCcw,
  Loader2,
  CheckSquare,
  Square,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/modules/commercial/services/apiClient";

interface Permission {
  id: number;
  title: string;
}

interface Role {
  id: number;
  title: string;
  permissions: Permission[];
}

interface RolesResponse {
  data: Role[];
}

interface PermissionsResponse {
  data: Permission[];
}

const EMPTY_FORM = {
  title: "",
  permissionIds: [] as number[],
};

/** Extrait le préfixe d'une permission (ex: "user_create" → "user") */
function getPrefix(title: string): string {
  const idx = title.indexOf("_");
  return idx > -1 ? title.slice(0, idx) : title;
}

/** Regroupe un tableau de permissions par préfixe */
function groupByPrefix(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const prefix = getPrefix(perm.title);
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(perm);
    return acc;
  }, {});
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [expandedRole, setExpandedRole] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiClient.get<RolesResponse>("/roles"),
        apiClient.get<PermissionsResponse>("/permissions"),
      ]);
      setRoles(rolesRes.data ?? []);
      setAllPermissions(permsRes.data ?? []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = roles.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setIsDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditId(role.id);
    setForm({
      title: role.title,
      permissionIds: role.permissions.map((p) => p.id),
    });
    setIsDialogOpen(true);
  };

  const togglePermission = (permId: number) => {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter((id) => id !== permId)
        : [...prev.permissionIds, permId],
    }));
  };

  const toggleGroupAll = (groupPerms: Permission[]) => {
    const allSelected = groupPerms.every((p) => form.permissionIds.includes(p.id));
    const groupIds = groupPerms.map((p) => p.id);
    setForm((prev) => ({
      ...prev,
      permissionIds: allSelected
        ? prev.permissionIds.filter((id) => !groupIds.includes(id))
        : [...new Set([...prev.permissionIds, ...groupIds])],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Nom du rôle requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await apiClient.put(`/roles/${editId}`, {
          title: form.title,
          permissions: form.permissionIds,
        });
        toast({ title: "Rôle modifié avec succès" });
      } else {
        await apiClient.post("/roles", {
          title: form.title,
          permissions: form.permissionIds,
        });
        toast({ title: "Rôle créé avec succès" });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirmId(null);
      toast({ title: "Rôle supprimé" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    }
  };

  // Stats
  const avgPermissions =
    roles.length > 0
      ? (
          roles.reduce((sum, r) => sum + r.permissions.length, 0) / roles.length
        ).toFixed(1)
      : "0";

  // Grouped permissions for dialog
  const permissionGroups = groupByPrefix(allPermissions);

  return (
    <>
      {/* Delete confirmation */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le rôle sera définitivement supprimé.
            </AlertDialogDescription>
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

      {/* Create/Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Modifier le rôle" : "Nouveau rôle"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {/* Title */}
            <div>
              <Label htmlFor="role-title">Nom du rôle *</Label>
              <Input
                id="role-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Comptable"
                className="mt-1"
              />
            </div>

            {/* Permissions grouped */}
            <div>
              <Label>Permissions</Label>
              <div className="mt-2 border rounded-md divide-y">
                {Object.keys(permissionGroups).length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3">
                    Aucune permission disponible
                  </p>
                ) : (
                  Object.entries(permissionGroups).map(([prefix, perms]) => {
                    const allSelected = perms.every((p) =>
                      form.permissionIds.includes(p.id)
                    );
                    return (
                      <div key={prefix} className="p-3 space-y-2">
                        {/* Group header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {prefix}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => toggleGroupAll(perms)}
                          >
                            {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                          </button>
                        </div>
                        {/* Permission checkboxes */}
                        <div className="grid grid-cols-1 gap-1.5">
                          {perms.map((perm) => {
                            const checked = form.permissionIds.includes(perm.id);
                            return (
                              <button
                                key={perm.id}
                                type="button"
                                className="flex items-center gap-2 text-sm text-left hover:text-primary transition-colors"
                                onClick={() => togglePermission(perm.id)}
                              >
                                {checked ? (
                                  <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                {perm.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-7 w-7" />
              Rôles & Permissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérer les rôles et leurs permissions associées.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rôle
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total rôles</p>
                <p className="text-3xl font-bold">{roles.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Permissions disponibles</p>
                <p className="text-3xl font-bold">{allPermissions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Square className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Permissions moy. / rôle</p>
                <p className="text-3xl font-bold">{avgPermissions}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table card */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle>{filtered.length} rôle(s)</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un rôle..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="w-28">Nb permissions</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Aucun rôle trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((role) => {
                      const isExpanded = expandedRole === role.id;
                      const shown = isExpanded
                        ? role.permissions
                        : role.permissions.slice(0, 6);
                      const overflow = role.permissions.length - 6;

                      return (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary shrink-0" />
                              {role.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{role.permissions.length}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {role.permissions.length === 0 ? (
                                <span className="text-muted-foreground text-sm">
                                  Aucune permission
                                </span>
                              ) : (
                                <>
                                  {shown.map((p) => (
                                    <Badge
                                      key={p.id}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {p.title}
                                    </Badge>
                                  ))}
                                  {!isExpanded && overflow > 0 && (
                                    <button
                                      type="button"
                                      className="text-xs text-primary hover:underline"
                                      onClick={() => setExpandedRole(role.id)}
                                    >
                                      +{overflow} de plus
                                    </button>
                                  )}
                                  {isExpanded && (
                                    <button
                                      type="button"
                                      className="text-xs text-muted-foreground hover:underline"
                                      onClick={() => setExpandedRole(null)}
                                    >
                                      Réduire
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmId(role.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
