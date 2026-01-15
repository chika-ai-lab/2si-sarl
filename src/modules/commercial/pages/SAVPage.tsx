import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Wrench,
  Plus,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Star,
  User,
  LayoutGrid,
  List,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  useTicketsSAV,
  useStatistiquesSAV,
  useCreateTicketSAV,
  useChangeStatutTicket,
} from "../hooks/useSAV";
import { useClients } from "../hooks/useClients";
import type {
  StatutTicketSAV,
  TypeTicketSAV,
  PrioriteTicket,
  TicketSAV,
} from "../types";
import { toast } from "@/hooks/use-toast";

export function SAVPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<StatutTicketSAV | "all">("all");
  const [prioriteFilter, setPrioriteFilter] = useState<PrioriteTicket | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TypeTicketSAV | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [page, setPage] = useState(1);
  const limit = 100; // Charge plus de tickets pour le Kanban

  // Fetch data
  const { data, isLoading, error } = useTicketsSAV({
    page,
    limit,
    search: searchQuery || undefined,
    statut: statutFilter !== "all" ? statutFilter : undefined,
    priorite: prioriteFilter !== "all" ? prioriteFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    sortBy: "dateOuverture",
    sortOrder: "desc",
  });

  const { data: statsData } = useStatistiquesSAV();
  const { data: clientsData } = useClients({ limit: 1000 });
  const createTicket = useCreateTicketSAV();
  const changeStatut = useChangeStatutTicket();

  const tickets = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;
  const clients = clientsData?.data || [];

  // Form state for create dialog
  const [createForm, setCreateForm] = useState({
    clientId: "",
    produitId: "",
    type: "reclamation" as TypeTicketSAV,
    priorite: "normale" as PrioriteTicket,
    sujet: "",
    description: "",
    sousGarantie: false,
  });

  const statutConfig = {
    ouvert: {
      label: "Ouvert",
      color: "bg-blue-100 text-blue-800",
      icon: AlertCircle,
    },
    en_cours: {
      label: "En cours",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    en_attente_pieces: {
      label: "En attente pièces",
      color: "bg-orange-100 text-orange-800",
      icon: AlertTriangle,
    },
    resolu: {
      label: "Résolu",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    ferme: {
      label: "Fermé",
      color: "bg-gray-100 text-gray-800",
      icon: CheckCircle,
    },
    annule: {
      label: "Annulé",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const prioriteConfig = {
    basse: { label: "Basse", color: "bg-gray-100 text-gray-800" },
    normale: { label: "Normale", color: "bg-blue-100 text-blue-800" },
    haute: { label: "Haute", color: "bg-orange-100 text-orange-800" },
    urgente: { label: "Urgente", color: "bg-red-100 text-red-800" },
  };

  const typeConfig = {
    reparation: { label: "Réparation" },
    remplacement: { label: "Remplacement" },
    retour: { label: "Retour" },
    reclamation: { label: "Réclamation" },
    garantie: { label: "Garantie" },
  };

  const handleCreateSubmit = async () => {
    if (!createForm.clientId || !createForm.sujet || !createForm.description) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTicket.mutateAsync({
        ...createForm,
        creePar: "user-001",
      });

      toast({
        title: "Ticket créé",
        description: "Le ticket SAV a été créé avec succès",
      });

      setIsCreateDialogOpen(false);
      setCreateForm({
        clientId: "",
        produitId: "",
        type: "reclamation",
        priorite: "normale",
        sujet: "",
        description: "",
        sousGarantie: false,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du ticket",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (ticketId: string) => {
    navigate(`/admin/commercial/sav/${ticketId}`);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.nom : clientId;
  };

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Nouveau ticket SAV</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client */}
            <div>
              <Label htmlFor="client">
                Client <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.clientId}
                onValueChange={(value) => setCreateForm({ ...createForm, clientId: value })}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type et Priorité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type de ticket</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, type: value as TypeTicketSAV })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reparation">Réparation</SelectItem>
                    <SelectItem value="remplacement">Remplacement</SelectItem>
                    <SelectItem value="retour">Retour</SelectItem>
                    <SelectItem value="reclamation">Réclamation</SelectItem>
                    <SelectItem value="garantie">Garantie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priorite">Priorité</Label>
                <Select
                  value={createForm.priorite}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, priorite: value as PrioriteTicket })
                  }
                >
                  <SelectTrigger id="priorite">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sujet */}
            <div>
              <Label htmlFor="sujet">
                Sujet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sujet"
                placeholder="Ex: Ordinateur ne démarre plus"
                value={createForm.sujet}
                onChange={(e) => setCreateForm({ ...createForm, sujet: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez le problème en détail..."
                rows={4}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>

            {/* Sous garantie */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="garantie"
                checked={createForm.sousGarantie}
                onChange={(e) =>
                  setCreateForm({ ...createForm, sousGarantie: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="garantie" className="cursor-pointer">
                Produit sous garantie
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createTicket.isPending}>
              {createTicket.isPending ? "Création..." : "Créer le ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Page Content */}
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Service Après-Vente</h2>
            <p className="text-muted-foreground">
              Gestion des tickets SAV, interventions et suivi client
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total tickets</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ouverts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En cours</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enCours}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.satisfactionMoyenne.toFixed(1)}/5
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coût total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.coutTotalMois)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and View Toggle */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro, sujet, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "kanban" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filter selects */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Statut</Label>
                  <Select
                    value={statutFilter}
                    onValueChange={(value) => setStatutFilter(value as StatutTicketSAV | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="ouvert">Ouvert</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="en_attente_pieces">En attente pièces</SelectItem>
                      <SelectItem value="resolu">Résolu</SelectItem>
                      <SelectItem value="ferme">Fermé</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Priorité</Label>
                  <Select
                    value={prioriteFilter}
                    onValueChange={(value) => setPrioriteFilter(value as PrioriteTicket | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Type</Label>
                  <Select
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value as TypeTicketSAV | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="reparation">Réparation</SelectItem>
                      <SelectItem value="remplacement">Remplacement</SelectItem>
                      <SelectItem value="retour">Retour</SelectItem>
                      <SelectItem value="reclamation">Réclamation</SelectItem>
                      <SelectItem value="garantie">Garantie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Display */}
        {viewMode === "kanban" ? (
          <KanbanBoard
            tickets={tickets}
            isLoading={isLoading}
            error={error}
            statutConfig={statutConfig}
            prioriteConfig={prioriteConfig}
            typeConfig={typeConfig}
            onViewDetails={handleViewDetails}
            getClientName={getClientName}
          />
        ) : (
          <TicketsTable
            tickets={tickets}
            isLoading={isLoading}
            error={error}
            statutConfig={statutConfig}
            prioriteConfig={prioriteConfig}
            typeConfig={typeConfig}
            pagination={pagination}
            page={page}
            setPage={setPage}
            onViewDetails={handleViewDetails}
            getClientName={getClientName}
          />
        )}
      </div>
    </>
  );
}

// Component for Kanban Board
function KanbanBoard({
  tickets,
  isLoading,
  error,
  statutConfig,
  prioriteConfig,
  typeConfig,
  onViewDetails,
  getClientName,
}: any) {
  const [draggedTicket, setDraggedTicket] = useState<TicketSAV | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const changeStatut = useChangeStatutTicket();

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            Erreur lors du chargement des tickets
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  // Group tickets by status
  const columns = [
    { status: "ouvert", label: "Ouvert", tickets: [] as TicketSAV[] },
    { status: "en_cours", label: "En cours", tickets: [] as TicketSAV[] },
    { status: "en_attente_pieces", label: "En attente pièces", tickets: [] as TicketSAV[] },
    { status: "resolu", label: "Résolu", tickets: [] as TicketSAV[] },
    { status: "ferme", label: "Fermé", tickets: [] as TicketSAV[] },
  ];

  tickets.forEach((ticket: TicketSAV) => {
    const column = columns.find((col) => col.status === ticket.statut);
    if (column) {
      column.tickets.push(ticket);
    }
  });

  const handleDragStart = (e: React.DragEvent, ticket: TicketSAV) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTicket || draggedTicket.statut === newStatus) {
      setDraggedTicket(null);
      return;
    }

    try {
      await changeStatut.mutateAsync({
        id: draggedTicket.id,
        statut: newStatus as StatutTicketSAV,
      });

      // Lancer les confettis si le ticket est résolu
      if (newStatus === "resolu") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#10b981", "#84cc16", "#eab308", "#f59e0b"],
        });
      }

      toast({
        title: "Ticket déplacé",
        description: `Le ticket a été déplacé vers ${statutConfig[newStatus].label}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de déplacer le ticket",
        variant: "destructive",
      });
    }

    setDraggedTicket(null);
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {columns.map((column) => {
        const config = statutConfig[column.status as keyof typeof statutConfig];
        const StatusIcon = config?.icon || AlertCircle;

        return (
          <div key={column.status} className="flex flex-col">
            {/* Column Header */}
            <div className="mb-3">
              <div className={`rounded-lg p-3 ${config?.color || "bg-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">{column.label}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {column.tickets.length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Column Content */}
            <div
              className={`flex-1 space-y-2 min-h-[200px] rounded-lg p-2 transition-colors ${
                dragOverColumn === column.status
                  ? 'bg-primary/5 ring-2 ring-primary ring-offset-2'
                  : 'bg-muted/20'
              }`}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {column.tickets.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Aucun ticket
                </div>
              ) : (
                column.tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, ticket)}
                    className={`cursor-move hover:shadow-md transition-all hover:scale-[1.02] ${
                      draggedTicket?.id === ticket.id ? 'opacity-50 scale-95' : ''
                    }`}
                    onClick={() => onViewDetails(ticket.id)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {ticket.numero}
                          </span>
                          {ticket.sousGarantie && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 text-[10px] h-5">
                              Garantie
                            </Badge>
                          )}
                        </div>

                        {/* Subject */}
                        <h4 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                          {ticket.sujet}
                        </h4>

                        {/* Client */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate">{getClientName(ticket.clientId)}</span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-[10px] h-5">
                            {typeConfig[ticket.type].label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${prioriteConfig[ticket.priorite].color} text-[10px] h-5`}
                          >
                            {prioriteConfig[ticket.priorite].label}
                          </Badge>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            {ticket.dateOuverture}
                          </span>
                          <span className="text-xs font-bold text-primary">
                            {formatCurrency(ticket.coutTotal)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Component for displaying tickets table
function TicketsTable({
  tickets,
  isLoading,
  error,
  statutConfig,
  prioriteConfig,
  typeConfig,
  pagination,
  page,
  setPage,
  onViewDetails,
  getClientName,
}: any) {
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            Erreur lors du chargement des tickets
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Aucun ticket trouvé</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tickets.map((ticket: TicketSAV) => {
          const StatusIcon = statutConfig[ticket.statut].icon;
          return (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onViewDetails(ticket.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left section - Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {ticket.numero}
                          </span>
                          {ticket.sousGarantie && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                              Sous garantie
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-base mb-1 line-clamp-1">
                          {ticket.sujet}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium">{getClientName(ticket.clientId)}</span>
                      </div>

                      <div className="h-4 w-px bg-border" />

                      <Badge variant="secondary" className="text-xs font-normal">
                        {typeConfig[ticket.type].label}
                      </Badge>

                      <Badge variant="outline" className={`${prioriteConfig[ticket.priorite].color} text-xs`}>
                        {prioriteConfig[ticket.priorite].label}
                      </Badge>

                      <Badge variant="outline" className={`${statutConfig[ticket.statut].color} text-xs`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statutConfig[ticket.statut].label}
                      </Badge>
                    </div>
                  </div>

                  {/* Right section - Date and Cost */}
                  <div className="flex flex-col items-end gap-2 min-w-[140px]">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Date ouverture</div>
                      <div className="text-sm font-medium">{ticket.dateOuverture}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Coût total</div>
                      <div className="text-base font-bold text-primary">
                        {formatCurrency(ticket.coutTotal)}
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(ticket.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} sur {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default SAVPage;
