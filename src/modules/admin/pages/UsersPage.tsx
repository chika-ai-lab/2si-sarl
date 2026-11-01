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
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCcw,
  Loader2,
  UserPlus,
  Key,
  Phone,
  CheckSquare,
  Square,
  MoreVertical,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/modules/commercial/services/apiClient";

interface BackendUser {
  id: number;
  name: string;
  email: string;
  telephone?: string;
  photo?: string;
  createdAt: string;
  agenceId?: number;
  agence?: { id: number; agence: string };
  roles: { id: number; title: string }[];
}

interface RoleOption {
  id: number;
  title: string;
}

/** Réponse de POST /users et POST /users/:id/reset-password. */
interface ResultatMotDePasseProvisoire {
  user: BackendUser;
  whatsapp: { envoye: boolean; raison?: string };
  /** Présent seulement si WhatsApp n'a pas pu transmettre le mot de passe. */
  motDePasseProvisoire?: string;
}

/** « +221771234567 » → « 77 123 45 67 ». */
function formaterTelephone(tel?: string | null): string {
  const m = tel?.match(/^\+221(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}` : (tel ?? "");
}

interface AgenceOption {
  id: number;
  agence: string;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  telephone: "",
  roleIds: [] as number[],
  agenceId: null as number | null,
};

export default function UsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [agences, setAgences] = useState<AgenceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [resetConfirm, setResetConfirm] = useState<BackendUser | null>(null);
  // Mot de passe que WhatsApp n'a pas pu transmettre : l'admin doit le communiquer.
  const [aTransmettre, setATransmettre] = useState<{ nom: string; motDePasse: string; raison?: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, agencesRes] = await Promise.all([
        apiClient.get<any>("/users"),
        apiClient.get<any>("/roles"),
        apiClient.get<any>("/agences"),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : (usersRes?.data ?? []));
      setRoles(Array.isArray(rolesRes) ? rolesRes : (rolesRes?.data ?? []));
      setAgences(Array.isArray(agencesRes) ? agencesRes : (agencesRes?.data ?? []));
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

  const chiffresRecherche = search.replace(/\D/g, "");
  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (!!chiffresRecherche && (u.telephone ?? "").includes(chiffresRecherche))
  );

  /** WhatsApp envoyé : simple confirmation. Sinon, on montre le mot de passe à transmettre. */
  const signalerMotDePasse = (r: ResultatMotDePasseProvisoire, action: string) => {
    if (r.whatsapp.envoye) {
      toast({ title: action, description: `Mot de passe provisoire envoyé par WhatsApp à ${r.user.name}.` });
    } else if (r.motDePasseProvisoire) {
      setATransmettre({ nom: r.user.name, motDePasse: r.motDePasseProvisoire, raison: r.whatsapp.raison });
    }
  };

  const handleResetPassword = async (user: BackendUser) => {
    setResetConfirm(null);
    try {
      const r = await apiClient.post<ResultatMotDePasseProvisoire>(`/users/${user.id}/reset-password`);
      signalerMotDePasse(r, "Mot de passe réinitialisé");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setIsDialogOpen(true);
  };

  const openEdit = (user: BackendUser) => {
    setEditId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      telephone: formaterTelephone(user.telephone),
      roleIds: user.roles.map((r) => Number(r.id)),
      agenceId: user.agenceId ?? null,
    });
    setIsDialogOpen(true);
  };

  const toggleRole = (roleId: number) => {
    const id = Number(roleId);
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(id)
        ? prev.roleIds.filter((r) => r !== id)
        : [...prev.roleIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.telephone.trim()) {
      toast({ title: "Nom et téléphone requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await apiClient.put(`/users/${editId}`, {
          name: form.name,
          telephone: form.telephone,
          roles: form.roleIds.map(Number),
          agenceId: form.agenceId ?? null,
        });
        toast({ title: "Utilisateur modifié avec succès" });
      } else {
        const r = await apiClient.post<ResultatMotDePasseProvisoire>("/users", {
          name: form.name,
          telephone: form.telephone,
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
          roles: form.roleIds,
          agenceId: form.agenceId ?? undefined,
        });
        signalerMotDePasse(r, "Utilisateur créé");
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
      await apiClient.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirmId(null);
      toast({ title: "Utilisateur supprimé" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    }
  };

  // Stats
  const distinctRolesUsed = new Set(
    users.flatMap((u) => u.roles.map((r) => r.id))
  ).size;

  const lastInscription =
    users.length > 0
      ? users.reduce((latest, u) =>
          new Date(u.createdAt) > new Date(latest.createdAt) ? u : latest
        ).createdAt
      : null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
              Cette action est irréversible. L'utilisateur sera définitivement supprimé.
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

      {/* Reset password confirmation */}
      <AlertDialog open={resetConfirm !== null} onOpenChange={(open) => !open && setResetConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser le mot de passe ?</AlertDialogTitle>
            <AlertDialogDescription>
              {resetConfirm?.name} recevra un mot de passe provisoire par WhatsApp au{" "}
              {formaterTelephone(resetConfirm?.telephone)} et devra le changer à sa prochaine connexion.
              Son mot de passe actuel cessera de fonctionner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => resetConfirm && handleResetPassword(resetConfirm)}>
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mot de passe provisoire non transmis par WhatsApp */}
      <Dialog open={aTransmettre !== null} onOpenChange={(open) => !open && setATransmettre(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>WhatsApp n'a pas pu envoyer le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {aTransmettre?.raison && <p className="text-muted-foreground">{aTransmettre.raison}</p>}
            <p>Communiquez ce mot de passe provisoire à {aTransmettre?.nom}. Il ne sera plus affiché ensuite.</p>
            <p className="font-mono text-lg tracking-wider text-center border rounded-md py-2 select-all">
              {aTransmettre?.motDePasse}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (aTransmettre) navigator.clipboard?.writeText(aTransmettre.motDePasse);
                toast({ title: "Copié" });
              }}
            >
              Copier
            </Button>
            <Button onClick={() => setATransmettre(null)}>J'ai transmis le mot de passe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="u-name">Nom *</Label>
              <Input
                id="u-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nom complet"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="u-tel">
                <Phone className="inline h-3.5 w-3.5 mr-1" />
                Téléphone WhatsApp *
              </Label>
              <Input
                id="u-tel"
                type="tel"
                inputMode="tel"
                value={form.telephone}
                onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
                placeholder="77 123 45 67"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sert d'identifiant de connexion.
                {!editId && " Le mot de passe provisoire est envoyé sur ce numéro par WhatsApp."}
              </p>
            </div>

            {!editId && (
              <div>
                <Label htmlFor="u-email">Email</Label>
                <Input
                  id="u-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Facultatif"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label>
                <Building2 className="inline h-3.5 w-3.5 mr-1" />
                Agence
              </Label>
              <Select
                value={form.agenceId ? String(form.agenceId) : "none"}
                onValueChange={(v) => setForm((p) => ({ ...p, agenceId: v === "none" ? null : Number(v) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner une agence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucune agence —</SelectItem>
                  {agences.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.agence}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rôles</Label>
              <div className="mt-2 border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun rôle disponible</p>
                ) : (
                  roles.map((role) => {
                    const rid = Number(role.id);
                    const checked = form.roleIds.includes(rid);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        className="flex items-center gap-2 w-full text-left text-sm hover:text-primary transition-colors"
                        onClick={() => toggleRole(rid)}
                      >
                        {checked ? (
                          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        {role.title}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
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
              <Users className="h-7 w-7" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-muted-foreground mt-1">
              Administrez les comptes, rôles et accès du système.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button onClick={openCreate}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Plus className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rôles utilisés</p>
                <p className="text-3xl font-bold">{distinctRolesUsed}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Dernière inscription</p>
                <p className="text-lg font-semibold">
                  {lastInscription
                    ? new Date(lastInscription).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table card */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle>{filtered.length} utilisateur(s)</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
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
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nom / Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Rôles</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Aucun utilisateur trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                            {getInitials(user.name)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.telephone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />{formaterTelephone(user.telephone)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.agence ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />{user.agence.agence}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((r) => (
                                <Badge key={r.id} variant="secondary" className="text-xs">
                                  {r.title}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">Aucun rôle</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" />Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!user.telephone}
                                onClick={() => setResetConfirm(user)}
                              >
                                <Key className="mr-2 h-4 w-4" />Réinitialiser le mot de passe
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteConfirmId(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
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
