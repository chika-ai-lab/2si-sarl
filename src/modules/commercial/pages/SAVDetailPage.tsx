import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  FileText,
  Image as ImageIcon,
  Star,
  User,
  Wrench,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  useTicketSAV,
  useChangeStatutTicket,
  useAddIntervention,
  useAjouterSatisfaction,
  useAssignerTicket,
} from "../hooks/useSAV";
import { useClients } from "../hooks/useClients";
import type { StatutTicketSAV, InterventionSAV } from "../types";
import { toast } from "@/hooks/use-toast";

export function SAVDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isInterventionDialogOpen, setIsInterventionDialogOpen] = useState(false);
  const [isSatisfactionDialogOpen, setIsSatisfactionDialogOpen] = useState(false);

  // Fetch data
  const { data, isLoading, error } = useTicketSAV(id || "");
  const { data: clientsData } = useClients({ limit: 1000 });
  const changeStatut = useChangeStatutTicket();
  const addIntervention = useAddIntervention();
  const ajouterSatisfaction = useAjouterSatisfaction();
  const assignerTicket = useAssignerTicket();

  const ticket = data?.data;
  const clients = clientsData?.data || [];

  // Form states
  const [interventionForm, setInterventionForm] = useState({
    technicienId: "",
    description: "",
    tempsIntervention: 0,
    cout: 0,
  });

  const [satisfactionForm, setSatisfactionForm] = useState({
    note: 5 as 1 | 2 | 3 | 4 | 5,
    commentaire: "",
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

  const handleChangeStatut = async (statut: StatutTicketSAV) => {
    if (!id) return;

    try {
      await changeStatut.mutateAsync({ id, statut });
      toast({
        title: "Statut modifié",
        description: `Le ticket a été marqué comme ${statutConfig[statut].label.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleAddIntervention = async () => {
    if (!id || !interventionForm.technicienId || !interventionForm.description) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await addIntervention.mutateAsync({
        ticketId: id,
        intervention: {
          date: new Date().toISOString().split("T")[0],
          technicienId: interventionForm.technicienId,
          technicien: "Technicien",
          description: interventionForm.description,
          piecesUtilisees: [],
          tempsIntervention: interventionForm.tempsIntervention,
          cout: interventionForm.cout,
        },
      });

      toast({
        title: "Intervention ajoutée",
        description: "L'intervention a été ajoutée avec succès",
      });

      setIsInterventionDialogOpen(false);
      setInterventionForm({
        technicienId: "",
        description: "",
        tempsIntervention: 0,
        cout: 0,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'intervention",
        variant: "destructive",
      });
    }
  };

  const handleAddSatisfaction = async () => {
    if (!id) return;

    try {
      await ajouterSatisfaction.mutateAsync({
        id,
        note: satisfactionForm.note,
        commentaire: satisfactionForm.commentaire,
      });

      toast({
        title: "Satisfaction enregistrée",
        description: "La note de satisfaction a été enregistrée",
      });

      setIsSatisfactionDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la satisfaction",
        variant: "destructive",
      });
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.nom} (${client.email})` : clientId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Ticket non trouvé</p>
          <Button onClick={() => navigate("/admin/commercial/sav")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statutConfig[ticket.statut].icon;

  return (
    <>
      {/* Intervention Dialog */}
      <Dialog open={isInterventionDialogOpen} onOpenChange={setIsInterventionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Ajouter une intervention</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="technicien">
                Technicien <span className="text-destructive">*</span>
              </Label>
              <Input
                id="technicien"
                placeholder="ID du technicien"
                value={interventionForm.technicienId}
                onChange={(e) =>
                  setInterventionForm({ ...interventionForm, technicienId: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="descIntervention">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="descIntervention"
                placeholder="Décrivez l'intervention effectuée..."
                rows={4}
                value={interventionForm.description}
                onChange={(e) =>
                  setInterventionForm({ ...interventionForm, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temps">Temps d'intervention (heures)</Label>
                <Input
                  id="temps"
                  type="number"
                  min="0"
                  step="0.5"
                  value={interventionForm.tempsIntervention}
                  onChange={(e) =>
                    setInterventionForm({
                      ...interventionForm,
                      tempsIntervention: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="cout">Coût (FCFA)</Label>
                <Input
                  id="cout"
                  type="number"
                  min="0"
                  value={interventionForm.cout}
                  onChange={(e) =>
                    setInterventionForm({ ...interventionForm, cout: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInterventionDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddIntervention} disabled={addIntervention.isPending}>
              {addIntervention.isPending ? "Ajout..." : "Ajouter l'intervention"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Satisfaction Dialog */}
      <Dialog open={isSatisfactionDialogOpen} onOpenChange={setIsSatisfactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Note de satisfaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Note (sur 5)</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant={satisfactionForm.note === n ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSatisfactionForm({
                        ...satisfactionForm,
                        note: n as 1 | 2 | 3 | 4 | 5,
                      })
                    }
                  >
                    <Star className="h-4 w-4" />
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="commentaireSat">Commentaire (optionnel)</Label>
              <Textarea
                id="commentaireSat"
                placeholder="Commentaire du client..."
                rows={3}
                value={satisfactionForm.commentaire}
                onChange={(e) =>
                  setSatisfactionForm({ ...satisfactionForm, commentaire: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSatisfactionDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddSatisfaction}
              disabled={ajouterSatisfaction.isPending}
            >
              {ajouterSatisfaction.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/commercial/sav")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Ticket {ticket.numero}</h2>
              <p className="text-muted-foreground">{ticket.sujet}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {ticket.statut === "ouvert" && (
              <Button onClick={() => handleChangeStatut("en_cours")}>
                <Clock className="mr-2 h-4 w-4" />
                Prendre en charge
              </Button>
            )}
            {ticket.statut === "en_cours" && (
              <>
                <Button variant="outline" onClick={() => handleChangeStatut("en_attente_pieces")}>
                  En attente pièces
                </Button>
                <Button onClick={() => handleChangeStatut("resolu")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Résoudre
                </Button>
              </>
            )}
            {ticket.statut === "resolu" && (
              <Button onClick={() => handleChangeStatut("ferme")}>Fermer le ticket</Button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
              <StatusIcon className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className={statutConfig[ticket.statut].color}>
                {statutConfig[ticket.statut].label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Priorité</CardTitle>
              <AlertCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className={prioriteConfig[ticket.priorite].color}>
                {prioriteConfig[ticket.priorite].label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coût total</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(ticket.coutTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pièces: {formatCurrency(ticket.coutPieces)} + MO: {formatCurrency(ticket.coutMainOeuvre)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interventions</CardTitle>
              <Wrench className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticket.interventions.length}</div>
              {ticket.noteSatisfaction && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                  <span className="text-sm font-semibold">{ticket.noteSatisfaction}/5</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Info */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-semibold">{getClientName(ticket.clientId)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Type de ticket</p>
                <Badge variant="outline">{ticket.type}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{ticket.description}</p>
              </div>

              {ticket.symptomes && (
                <div>
                  <p className="text-sm text-muted-foreground">Symptômes</p>
                  <p className="text-sm">{ticket.symptomes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date ouverture</p>
                  <p className="font-semibold">{ticket.dateOuverture}</p>
                </div>

                {ticket.datePrevueResolution && (
                  <div>
                    <p className="text-sm text-muted-foreground">Résolution prévue</p>
                    <p className="font-semibold">{ticket.datePrevueResolution}</p>
                  </div>
                )}
              </div>

              {ticket.sousGarantie && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Sous garantie</p>
                      {ticket.dateFinGarantie && (
                        <p className="text-sm">Jusqu'au {ticket.dateFinGarantie}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {ticket.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{ticket.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents et pièces jointes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Photos ({ticket.photos.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ticket.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 flex items-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{photo.split("/").pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ticket.documents.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Documents ({ticket.documents.length})</p>
                  <div className="space-y-2">
                    {ticket.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{doc.split("/").pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ticket.photos.length === 0 && ticket.documents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun document joint
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interventions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historique des interventions</CardTitle>
              <Button size="sm" onClick={() => setIsInterventionDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une intervention
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ticket.interventions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune intervention enregistrée
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Technicien</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Temps (h)</TableHead>
                    <TableHead className="text-right">Coût</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticket.interventions.map((intervention) => (
                    <TableRow key={intervention.id}>
                      <TableCell className="font-medium">{intervention.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {intervention.technicien}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm">{intervention.description}</p>
                        {intervention.piecesUtilisees && intervention.piecesUtilisees.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Pièces utilisées:</p>
                            {intervention.piecesUtilisees.map((piece, idx) => (
                              <p key={idx} className="text-xs">
                                • {piece.nom} (x{piece.quantite}) - {formatCurrency(piece.prix)}
                              </p>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{intervention.tempsIntervention}h</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(intervention.cout)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Satisfaction */}
        {ticket.statut === "resolu" || ticket.statut === "ferme" ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Satisfaction client</CardTitle>
                {!ticket.noteSatisfaction && (
                  <Button size="sm" onClick={() => setIsSatisfactionDialogOpen(true)}>
                    <Star className="mr-2 h-4 w-4" />
                    Ajouter une note
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {ticket.noteSatisfaction ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-orange-500 text-orange-500" />
                    <span className="text-2xl font-bold">{ticket.noteSatisfaction}/5</span>
                  </div>
                  {ticket.commentaireSatisfaction && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm italic">"{ticket.commentaireSatisfaction}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune note de satisfaction enregistrée
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}

export default SAVDetailPage;
