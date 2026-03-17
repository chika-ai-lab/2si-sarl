import { useState, useEffect } from "react";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  UserCircle, Search, Plus, Mail, Phone, Building2, Edit, Trash2, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ContactType = "client" | "fournisseur" | "partenaire" | "interne";

interface Contact {
  id: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  poste?: string;
  email: string;
  telephone: string;
  type: ContactType;
  notes?: string;
  dateCreation: string;
}

const TYPE_CONFIG: Record<ContactType, { label: string; color: string }> = {
  client:      { label: "Client",      color: "bg-blue-100 text-blue-800" },
  fournisseur: { label: "Fournisseur", color: "bg-purple-100 text-purple-800" },
  partenaire:  { label: "Partenaire",  color: "bg-green-100 text-green-800" },
  interne:     { label: "Interne",     color: "bg-gray-100 text-gray-700" },
};

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "ct-001", nom: "Diallo", prenom: "Mamadou", entreprise: "SARL Diallo & Frères",
    poste: "Directeur Commercial", email: "m.diallo@diallo-freres.sn",
    telephone: "+221 77 123 45 67", type: "client", dateCreation: "2024-01-10",
    notes: "Client fidèle depuis 2022"
  },
  {
    id: "ct-002", nom: "Sow", prenom: "Fatou", entreprise: "Groupe TechAfrique",
    poste: "Responsable Achats", email: "f.sow@techafrique.sn",
    telephone: "+221 76 234 56 78", type: "client", dateCreation: "2024-03-15"
  },
  {
    id: "ct-003", nom: "Ba", prenom: "Ibrahim", entreprise: "Fournisseur Nord",
    poste: "Directeur des Ventes", email: "i.ba@fournisseur-nord.sn",
    telephone: "+221 70 345 67 89", type: "fournisseur", dateCreation: "2024-02-20"
  },
  {
    id: "ct-004", nom: "Ndiaye", prenom: "Aissatou",
    poste: "Responsable Commercial", email: "a.ndiaye@2si.sarl",
    telephone: "+221 77 456 78 90", type: "interne", dateCreation: "2023-06-01"
  },
  {
    id: "ct-005", nom: "Fall", prenom: "Cheikh", entreprise: "CBAO Banque",
    poste: "Chargé de Clientèle", email: "c.fall@cbao.sn",
    telephone: "+221 76 567 89 01", type: "partenaire", dateCreation: "2024-04-08"
  },
];

const EMPTY_FORM = { nom: "", prenom: "", entreprise: "", poste: "", email: "", telephone: "", type: "client" as ContactType, notes: "" };

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContactType | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchContacts = async () => {
    try {
      const res = await apiClient.get<any>('/clients');
      const items: any[] = res.data ?? res ?? [];
      const mapped: Contact[] = items.map((item: any) => ({
        id: String(item.id),
        nom: item.nom ?? (item.nom_complet?.split(" ")[1] ?? ""),
        prenom: item.prenom ?? (item.nom_complet?.split(" ")[0] ?? ""),
        entreprise: item.raison_sociale ?? "",
        poste: "",
        email: item.email ?? "",
        telephone: item.telephone ?? "",
        type: "client" as ContactType,
        notes: item.notes ?? "",
        dateCreation: item.created_at?.slice(0, 10) ?? "",
      }));
      setContacts(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.entreprise?.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditId(contact.id);
    setForm({
      nom: contact.nom, prenom: contact.prenom, entreprise: contact.entreprise ?? "",
      poste: contact.poste ?? "", email: contact.email, telephone: contact.telephone,
      type: contact.type, notes: contact.notes ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.email) {
      toast({ title: "Champs requis", description: "Nom et email sont obligatoires.", variant: "destructive" });
      return;
    }
    const payload = {
      nom: form.nom,
      prenom: form.prenom,
      raison_sociale: form.entreprise,
      email: form.email,
      telephone: form.telephone,
      notes: form.notes,
      type: 'professionnel',
      statut: 'actif',
    };
    try {
      if (editId) {
        await apiClient.put(`/clients/${editId}`, payload);
        setContacts((prev) => prev.map((c) => c.id === editId ? { ...c, ...form } : c));
        toast({ title: "Contact modifié" });
      } else {
        await apiClient.post('/clients', payload);
        await fetchContacts();
        toast({ title: "Contact créé" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/clients/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Contact supprimé" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const stats = {
    total:       contacts.length,
    clients:     contacts.filter((c) => c.type === "client").length,
    fournisseurs: contacts.filter((c) => c.type === "fournisseur").length,
    partenaires: contacts.filter((c) => c.type === "partenaire").length,
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
      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le contact" : "Nouveau contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom *</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <Label>Prénom *</Label>
              <Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div>
              <Label>Entreprise</Label>
              <Input value={form.entreprise} onChange={(e) => setForm({ ...form, entreprise: e.target.value })} />
            </div>
            <div>
              <Label>Poste</Label>
              <Input value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ContactType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="fournisseur">Fournisseur</SelectItem>
                  <SelectItem value="partenaire">Partenaire</SelectItem>
                  <SelectItem value="interne">Interne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editId ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserCircle className="h-7 w-7" /> Contacts
            </h2>
            <p className="text-muted-foreground">Gestion de vos contacts professionnels</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nouveau contact</Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total", value: stats.total,        color: "text-foreground" },
            { label: "Clients", value: stats.clients,     color: "text-blue-600" },
            { label: "Fournisseurs", value: stats.fournisseurs, color: "text-purple-600" },
            { label: "Partenaires", value: stats.partenaires, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ContactType | "all")}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Tous les types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="fournisseur">Fournisseurs</SelectItem>
                  <SelectItem value="partenaire">Partenaires</SelectItem>
                  <SelectItem value="interne">Internes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>{filtered.length} contact(s)</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucun contact trouvé.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Entreprise / Poste</TableHead>
                    <TableHead>Coordonnées</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Depuis</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                            {c.prenom[0]}{c.nom[0]}
                          </div>
                          <div>
                            <p className="font-medium">{c.prenom} {c.nom}</p>
                            {c.notes && <p className="text-xs text-muted-foreground truncate max-w-32">{c.notes}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.entreprise && (
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Building2 className="h-3 w-3 text-muted-foreground" />{c.entreprise}
                          </div>
                        )}
                        {c.poste && <p className="text-xs text-muted-foreground">{c.poste}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a>
                          </div>
                          {c.telephone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />{c.telephone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={TYPE_CONFIG[c.type].color}>
                          {TYPE_CONFIG[c.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(c.dateCreation).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ContactsPage;
