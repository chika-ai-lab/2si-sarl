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
  LayoutDashboard,
  Settings2,
  FileText,
  Users,
  ShoppingCart,
  PackageSearch,
  DollarSign,
  Eye,
  PencilLine,
  Trash,
  Key,
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

/** Labels lisibles pour chaque permission connue */
const PERM_LABELS: Record<string, { label: string; description?: string; icon: React.ElementType }> = {
  view_dashboard:         { label: "Voir le tableau de bord",     description: "Accès aux statistiques globales",                    icon: LayoutDashboard },
  manage_clients:         { label: "Gérer les clients",           description: "Créer, modifier et archiver des clients",            icon: Users },
  manage_commandes:       { label: "Gérer les commandes",         description: "Saisir et suivre les commandes clients",             icon: ShoppingCart },
  manage_achats:          { label: "Gérer les achats",            description: "Passer et suivre les commandes fournisseurs",        icon: PackageSearch },
  manage_finance:         { label: "Gérer les finances",          description: "Accès aux transactions et à la comptabilité",        icon: DollarSign },
  manage_users:           { label: "Gérer les utilisateurs",      description: "Créer des comptes et attribuer des rôles",           icon: Users },
  facture_client_access:  { label: "Accéder aux factures",        description: "Voir la liste des factures clients",                 icon: FileText },
  facture_client_show:    { label: "Voir le détail d'une facture",description: "Ouvrir et lire une facture individuelle",            icon: Eye },
  facture_client_create:  { label: "Créer une facture",           description: "Générer une nouvelle facture client",               icon: PencilLine },
  facture_client_edit:    { label: "Modifier une facture",        description: "Corriger ou mettre à jour une facture",             icon: PencilLine },
  facture_client_delete:  { label: "Supprimer une facture",       description: "Supprimer définitivement une facture",              icon: Trash },
};

/** Métadonnées des groupes de permissions */
const GROUP_META: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  view:    { label: "Tableaux de bord", icon: LayoutDashboard, bg: "bg-blue-50",   text: "text-blue-700" },
  manage:  { label: "Gestion",          icon: Settings2,        bg: "bg-orange-50", text: "text-orange-700" },
  facture: { label: "Factures clients", icon: FileText,         bg: "bg-purple-50", text: "text-purple-700" },
};

/** Label lisible pour une permission */
function permLabel(title: string): string {
  return PERM_LABELS[title]?.label ?? title.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/** Icône d'une permission */
function PermIcon({ title, className }: { title: string; className?: string }) {
  const Icon = PERM_LABELS[title]?.icon ?? Key;
  return <Icon className={className ?? "h-3.5 w-3.5"} />;
}

/** Extrait le préfixe d'une permission (ex: "facture_client_access" → "facture") */
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
        apiClient.get<Role[]>("/roles"),
        apiClient.get<Permission[]>("/permissions"),
      ]);
      setRoles(rolesRes ?? []);
      setAllPermissions(permsRes ?? []);
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
                    const meta = GROUP_META[prefix];
                    const GroupIcon = meta?.icon ?? Shield;
                    return (
                      <div key={prefix} className="p-3 space-y-2">
                        {/* Group header */}
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${meta?.bg ?? "bg-gray-50"}`}>
                            <GroupIcon className={`h-3.5 w-3.5 ${meta?.text ?? "text-gray-600"}`} />
                            <span className={`text-xs font-semibold uppercase tracking-wide ${meta?.text ?? "text-gray-600"}`}>
                              {meta?.label ?? prefix}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => toggleGroupAll(perms)}
                          >
                            {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                          </button>
                        </div>
                        {/* Permission checkboxes */}
                        <div className="grid grid-cols-1 gap-1">
                          {perms.map((perm) => {
                            const checked = form.permissionIds.includes(perm.id);
                            const desc = PERM_LABELS[perm.title]?.description;
                            return (
                              <button
                                key={perm.id}
                                type="button"
                                className={`flex items-start gap-2.5 text-left p-2 rounded-lg border transition-colors ${
                                  checked
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-transparent hover:bg-muted/50"
                                }`}
                                onClick={() => togglePermission(perm.id)}
                              >
                                {checked ? (
                                  <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className="text-sm font-medium leading-tight">
                                    {permLabel(perm.title)}
                                  </p>
                                  {desc && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                                  )}
                                </div>
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
                                      className="text-xs flex items-center gap-1"
                                    >
                                      <PermIcon title={p.title} className="h-3 w-3" />
                                      {permLabel(p.title)}
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
