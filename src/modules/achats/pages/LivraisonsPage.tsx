import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Truck, Package, CheckCircle2, Clock, RefreshCcw, Printer,
  FileText, User, Phone, Car, CalendarDays, MapPin,
} from "lucide-react";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { companyConfig } from "@/config/company.config";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LigneCommande {
  id: string;
  produit?: { id: string; nom: string; reference?: string };
  quantite: number;
  prixUnitaire: number;
  typeLivraison?: string;
}

interface CommandeLivraison {
  id: string;
  reference: string;
  statut: string;
  dateCommande: string;
  dateLivraison?: string;
  client?: {
    id: string;
    nom: string;
    prenom?: string;
    raisonSociale?: string;
    telephone: string;
    adresse?: { ville?: string; rue?: string };
  };
  lignes: LigneCommande[];
  total: number;
  notes?: string;
  commercial?: string;
  banque?: string;
}

interface BLForm {
  chauffeurNom: string;
  chauffeurTel: string;
  matricule: string;
  datePlanifiee: string;
}

const EMPTY_BL_FORM: BLForm = {
  chauffeurNom: "",
  chauffeurTel: "",
  matricule: "",
  datePlanifiee: new Date().toISOString().slice(0, 16),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildBLCNumber(id: string | number): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(id).padStart(5, "0");
  return `BLC${yy}${mm}${seq}`;
}

function buildCONumber(id: string | number): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const seq = String(id).padStart(4, "0");
  return `CO${yy}${mm}-${seq}`;
}

function clientDisplayName(c?: CommandeLivraison["client"]): string {
  if (!c) return "—";
  return c.raisonSociale || `${c.nom} ${c.prenom || ""}`.trim();
}

function formatDatetime(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).replace(",", "");
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Print functions ──────────────────────────────────────────────────────────

function printBLC(commande: CommandeLivraison, blForm: BLForm) {
  const blcNum = buildBLCNumber(commande.id);
  const clientName = clientDisplayName(commande.client);
  const clientTel = commande.client?.telephone || "—";
  const clientVille = commande.client?.adresse?.ville || "Dakar";
  const datePlanifiee = formatDatetime(blForm.datePlanifiee);

  const lignesHtml = commande.lignes.map((l) => {
    const ref = l.produit?.reference ? `[${l.produit.reference}]` : "";
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">
        ${ref} ${l.produit?.nom || "Produit"}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:600">
        ${l.quantite.toFixed(2)}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">COL/Stock</td>
    </tr>`;
  }).join("");

  // Simple barcode using text
  const barcodeHtml = `<div style="font-family:monospace;font-size:24px;letter-spacing:4px;border:1px solid #000;padding:4px 8px;display:inline-block">
    |||||||||||||||||||||||||||||||
  </div><div style="font-size:11px;margin-top:2px">${blcNum}</div>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>BL Chauffeur - ${blcNum}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #000; padding: 24px; }
    h1 { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; }
    .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .info-block { margin-bottom: 16px; }
    .info-block p { line-height: 1.6; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0; padding: 12px; border: 1px solid #ccc; }
    .meta-item p:first-child { font-size: 11px; color: #555; margin-bottom: 2px; }
    .meta-item p:last-child { font-weight: bold; }
    .products-table { margin: 16px 0; }
    .products-table th { background: #222; color: white; padding: 8px 12px; text-align: left; font-weight: 600; }
    .driver-section { margin-top: 20px; border: 1px solid #ccc; padding: 14px; }
    .driver-section h3 { margin-bottom: 10px; font-size: 13px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
    .driver-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .driver-field p:first-child { font-size: 11px; color: #555; }
    .driver-field p:last-child { font-weight: 600; border-bottom: 1px solid #ccc; padding-bottom: 4px; min-height: 22px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 32px; }
    .sig-box { text-align: center; }
    .sig-box .line { border-bottom: 1px solid #000; margin: 40px 0 8px; }
    .sig-box p { font-size: 12px; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="header-grid">
    <div class="info-block">
      <p style="font-size:11px;color:#555">Adresse de livraison :</p>
      <p style="font-weight:600">${clientName}</p>
      <p>${clientVille}, ${companyConfig.address.country}</p>
      <p>📞 ${clientTel}</p>
    </div>
    <div style="text-align:right">
      ${barcodeHtml}
    </div>
  </div>

  <h1>${blcNum}</h1>

  <div class="meta-grid">
    <div class="meta-item">
      <p>Commande</p>
      <p>${commande.reference}</p>
    </div>
    <div class="meta-item">
      <p>Statut</p>
      <p>Prêt</p>
    </div>
    <div class="meta-item">
      <p>Date planifiée</p>
      <p>${datePlanifiee}</p>
    </div>
  </div>

  <table class="products-table">
    <thead>
      <tr>
        <th>Produit</th>
        <th style="text-align:center;width:100px">Quantité</th>
        <th style="width:120px">De</th>
      </tr>
    </thead>
    <tbody>
      ${lignesHtml}
    </tbody>
  </table>

  <div class="driver-section">
    <h3>Informations de transport</h3>
    <div class="driver-grid">
      <div class="driver-field">
        <p>Nom du chauffeur :</p>
        <p>${blForm.chauffeurNom || "—"}</p>
      </div>
      <div class="driver-field">
        <p>Numéro du chauffeur :</p>
        <p>${blForm.chauffeurTel || "—"}</p>
      </div>
      <div class="driver-field">
        <p>Matricule du véhicule :</p>
        <p>${blForm.matricule || "—"}</p>
      </div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <div class="line"></div>
      <p>Signature du Chauffeur</p>
    </div>
    <div class="sig-box">
      <div class="line"></div>
      <p>Signature Comptable</p>
    </div>
    <div class="sig-box">
      <div class="line"></div>
      <p>Signature Client</p>
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=794,height=1123");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }
}

function printFicheExpedition(commande: CommandeLivraison) {
  const coNum = buildCONumber(commande.id);
  const dateStr = formatDateLong(new Date().toISOString());
  const clientName = clientDisplayName(commande.client);
  const clientVille = commande.client?.adresse?.ville || "—";
  const clientTel = commande.client?.telephone || "—";
  const commercial = commande.commercial || "—";
  const agence = commande.banque ? `${commande.banque} - ${clientVille.toUpperCase()}` : clientVille.toUpperCase();

  const lignesHtml = commande.lignes.map((l) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #ddd">${l.produit?.nom || "Produit"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #ddd;text-align:center">${l.quantite}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #ddd;text-align:center">${l.quantite}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Fiche d'Expédition - ${coNum}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #000; padding: 28px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #000; }
    .company-info p { line-height: 1.5; font-size: 12px; }
    .company-name { font-weight: bold; font-size: 15px; margin-bottom: 4px; }
    .doc-title { text-align: right; }
    .doc-title h2 { font-size: 18px; font-weight: bold; }
    .doc-title .ref { font-weight: bold; font-size: 14px; color: #333; margin-top: 4px; }
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 20px 0; }
    .addr-box { border: 1px solid #ccc; padding: 12px; }
    .addr-box h4 { font-size: 11px; text-transform: uppercase; color: #555; margin-bottom: 6px; letter-spacing: 0.5px; }
    .addr-box p { line-height: 1.6; }
    .meta-row { display: flex; gap: 32px; margin: 16px 0; font-size: 12px; }
    .meta-row span { color: #555; margin-right: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    thead tr { background: #000; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .qr-placeholder { width: 72px; height: 72px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #aaa; }
    .footer { margin-top: 32px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="page-header">
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div style="width:48px;height:48px;background:#1a1a2e;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:11px">2SI</div>
        <div>
          <div class="company-name">${companyConfig.name}</div>
          <div style="font-size:11px;color:#555">${companyConfig.tagline}</div>
        </div>
      </div>
      <div class="company-info">
        <p>${companyConfig.address.street}</p>
        <p>Tél : ${companyConfig.phone} - 77 225 83 83 - 77 420 90 03</p>
        <p>Email: ${companyConfig.email}</p>
        <p>web: https://www.sen-services.com</p>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:12px">
      <div class="qr-placeholder">QR CODE</div>
      <div class="doc-title">
        <h2>Fiche d'Expédition</h2>
        <div class="ref">${coNum}</div>
        <div style="font-size:12px;color:#555;margin-top:2px">Date : ${dateStr}</div>
      </div>
    </div>
  </div>

  <div class="addresses">
    <div class="addr-box">
      <h4>Émetteur</h4>
      <p style="font-weight:600">${companyConfig.name}</p>
      <p>${companyConfig.address.street}</p>
      <p>${companyConfig.address.city}</p>
      <p>Tél : ${companyConfig.phone}</p>
    </div>
    <div class="addr-box">
      <h4>Adressé à</h4>
      <p style="font-weight:600">${clientName}</p>
      <p>${clientVille.toUpperCase()}</p>
      <p>${clientTel}</p>
    </div>
  </div>

  <div class="meta-row">
    <div><span>Commercial :</span> ${commercial}</div>
    <div><span>Agence :</span> ${agence}</div>
    <div><span>Commande :</span> ${commande.reference}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:60%">Désignation</th>
        <th style="text-align:center">Qte commande</th>
        <th style="text-align:center">Qte expédiée</th>
      </tr>
    </thead>
    <tbody>
      ${lignesHtml}
    </tbody>
  </table>

  <div style="margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:32px">
    <div>
      <div style="border-bottom:1px solid #000;height:48px;margin-bottom:8px"></div>
      <p style="font-size:12px;text-align:center">Signature / Cachet Expéditeur</p>
    </div>
    <div>
      <div style="border-bottom:1px solid #000;height:48px;margin-bottom:8px"></div>
      <p style="font-size:12px;text-align:center">Signature Destinataire</p>
    </div>
  </div>

  <div class="footer">
    ${companyConfig.legalInfo.registrationNumber} — ${companyConfig.address.city}, ${companyConfig.address.country}
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=794,height=1123");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

const ETAT_MAP: Record<string, string> = {
  brouillon: "brouillon", validee: "validee", en_attente: "en_attente",
  en_cours: "validee", livree: "livree", annulee: "annulee",
  validé: "validee", valide: "validee", livré: "livree",
  livre: "livree", annulé: "annulee", annule: "annulee",
  confirmee: "validee",
};

function mapCommande(c: any): CommandeLivraison {
  const statut = ETAT_MAP[c.etat] || c.etat || "en_attente";
  return {
    id: String(c.id),
    reference: c.reference || `CMD-${String(c.id).padStart(5, "0")}`,
    statut,
    dateCommande: c.date || c.created_at?.split("T")[0] || "",
    dateLivraison: c.date_livraison,
    client: c.client ? {
      id: String(c.client.id),
      nom: c.client.nom || "",
      prenom: c.client.prenom,
      raisonSociale: c.client.raison_sociale,
      telephone: c.client.telephone || "",
      adresse: { ville: c.client.ville || "Dakar", rue: c.client.adresse || "" },
    } : undefined,
    lignes: (c.articles || []).map((a: any) => ({
      id: String(a.id),
      produit: a.article ? { id: String(a.article.id), nom: a.article.libelle, reference: a.article.reference } : undefined,
      quantite: Number(a.quantite) || 1,
      prixUnitaire: Number(a.prix) || 0,
      typeLivraison: a.type_livraison || "agence",
    })),
    total: Number(c.montant) || 0,
    notes: c.note,
    commercial: c.commercial_nom || c.user?.name,
    banque: c.mode_paiement,
  };
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUT_LABEL: Record<string, { label: string; color: string }> = {
  brouillon:  { label: "Brouillon",    color: "bg-gray-100 text-gray-700" },
  en_attente: { label: "En attente",   color: "bg-yellow-100 text-yellow-800" },
  validee:    { label: "Validée",      color: "bg-blue-100 text-blue-800" },
  en_cours:   { label: "En livraison", color: "bg-orange-100 text-orange-800" },
  livree:     { label: "Livrée",       color: "bg-green-100 text-green-800" },
  annulee:    { label: "Annulée",      color: "bg-red-100 text-red-800" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LivraisonsPage() {
  const qc = useQueryClient();

  const { data: rawData } = useQuery({
    queryKey: ["livraisons-commandes"],
    queryFn: async (): Promise<CommandeLivraison[]> => {
      const res = await apiClient.get<any>("/commande-clients");
      const items: any[] = res.data ?? res ?? [];
      return items.map(mapCommande).filter((c) =>
        ["validee", "en_cours", "livree"].includes(c.statut)
      );
    },
  });

  const commandes = rawData ?? [];
  const loading = rawData === undefined;

  const [activeTab, setActiveTab] = useState<"validee" | "en_cours" | "livree">("validee");
  const [selectedCommande, setSelectedCommande] = useState<CommandeLivraison | null>(null);
  const [blForm, setBlForm] = useState<BLForm>(EMPTY_BL_FORM);
  const [blDialogOpen, setBlDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const aPrep   = commandes.filter((c) => c.statut === "validee");
  const enLivr  = commandes.filter((c) => c.statut === "en_cours");
  const livrees = commandes.filter((c) => c.statut === "livree");

  const openBLDialog = (cmd: CommandeLivraison) => {
    setSelectedCommande(cmd);
    setBlForm({ ...EMPTY_BL_FORM });
    setBlDialogOpen(true);
  };

  const handleChangeStatut = async (cmd: CommandeLivraison, newEtat: string) => {
    setActionLoading(cmd.id);
    // Optimistic
    qc.setQueryData<CommandeLivraison[]>(["livraisons-commandes"], (old = []) =>
      old.map((c) => c.id === cmd.id ? { ...c, statut: newEtat } : c)
    );
    try {
      await apiClient.put(`/commande-clients/${cmd.id}`, { etat: newEtat });
      toast({ title: newEtat === "en_cours" ? "Commande mise en livraison" : "Commande marquée livrée" });
    } catch {
      qc.invalidateQueries({ queryKey: ["livraisons-commandes"] });
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const visibleRows = activeTab === "validee" ? aPrep : activeTab === "en_cours" ? enLivr : livrees;

  return (
    <>
      {/* BL Dialog */}
      <Dialog open={blDialogOpen} onOpenChange={setBlDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Bon de Livraison — {selectedCommande?.reference}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5" /> Nom du chauffeur
              </Label>
              <Input
                value={blForm.chauffeurNom}
                onChange={(e) => setBlForm((p) => ({ ...p, chauffeurNom: e.target.value }))}
                placeholder="Ex: Pape Ngom"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1">
                <Phone className="h-3.5 w-3.5" /> Numéro du chauffeur
              </Label>
              <Input
                value={blForm.chauffeurTel}
                onChange={(e) => setBlForm((p) => ({ ...p, chauffeurTel: e.target.value }))}
                placeholder="Ex: 76 311 29 47"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1">
                <Car className="h-3.5 w-3.5" /> Matricule du véhicule
              </Label>
              <Input
                value={blForm.matricule}
                onChange={(e) => setBlForm((p) => ({ ...p, matricule: e.target.value }))}
                placeholder="Ex: AA788BZ"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1">
                <CalendarDays className="h-3.5 w-3.5" /> Date planifiée
              </Label>
              <Input
                type="datetime-local"
                value={blForm.datePlanifiee}
                onChange={(e) => setBlForm((p) => ({ ...p, datePlanifiee: e.target.value }))}
              />
            </div>

            {/* Client summary */}
            {selectedCommande?.client && (
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p className="font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {clientDisplayName(selectedCommande.client)}
                </p>
                <p className="text-muted-foreground pl-5">
                  {selectedCommande.client.adresse?.ville || "Dakar"} — {selectedCommande.client.telephone}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBlDialogOpen(false)}>Annuler</Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedCommande) printFicheExpedition(selectedCommande);
              }}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Fiche d'Expédition
            </Button>
            <Button
              onClick={() => {
                if (selectedCommande) {
                  printBLC(selectedCommande, blForm);
                  // Auto-passer en livraison si encore validee
                  if (selectedCommande.statut === "validee") {
                    handleChangeStatut(selectedCommande, "en_cours");
                  }
                  setBlDialogOpen(false);
                }
              }}
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Imprimer BL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-7 w-7" /> Livraisons
            </h2>
            <p className="text-muted-foreground">Traitement et expédition des commandes validées</p>
          </div>
          <Button
            variant="outline"
            onClick={() => qc.invalidateQueries({ queryKey: ["livraisons-commandes"] })}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">À préparer</p>
                <p className="text-3xl font-bold">{loading ? "—" : aPrep.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Truck className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">En livraison</p>
                <p className="text-3xl font-bold">{loading ? "—" : enLivr.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Livrées</p>
                <p className="text-3xl font-bold">{loading ? "—" : livrees.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="validee" className="gap-2">
              <Clock className="h-4 w-4" />
              À préparer
              {aPrep.length > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white text-xs px-1.5">{aPrep.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="en_cours" className="gap-2">
              <Truck className="h-4 w-4" />
              En livraison
              {enLivr.length > 0 && (
                <Badge className="ml-1 bg-orange-500 text-white text-xs px-1.5">{enLivr.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="livree" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Livrées
            </TabsTrigger>
          </TabsList>

          {(["validee", "en_cours", "livree"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {loading ? (
                <Card><CardContent className="p-0">
                  <div className="space-y-0">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border-b">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-48 flex-1" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
              ) : visibleRows.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>{tab === "validee" ? "Aucune commande à préparer" : tab === "en_cours" ? "Aucune livraison en cours" : "Aucune livraison terminée"}</p>
                </CardContent></Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Référence</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Produits</TableHead>
                          <TableHead className="whitespace-nowrap">Total</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleRows.map((cmd) => {
                          const st = STATUT_LABEL[cmd.statut] ?? STATUT_LABEL.en_attente;
                          const isLoading = actionLoading === cmd.id;
                          return (
                            <TableRow key={cmd.id}>
                              <TableCell>
                                <span className="font-mono font-semibold text-sm">{cmd.reference}</span>
                                <div className="text-xs text-muted-foreground mt-0.5">{cmd.dateCommande}</div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{clientDisplayName(cmd.client)}</p>
                                <p className="text-xs text-muted-foreground">{cmd.client?.telephone || "—"}</p>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5 max-w-xs">
                                  {cmd.lignes.slice(0, 2).map((l) => (
                                    <div key={l.id} className="flex items-center gap-1.5 text-sm">
                                      <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                                      <span className="truncate">{l.produit?.nom || "Produit"}</span>
                                      <Badge variant="outline" className="text-xs shrink-0">×{l.quantite}</Badge>
                                    </div>
                                  ))}
                                  {cmd.lignes.length > 2 && (
                                    <span className="text-xs text-muted-foreground">+{cmd.lignes.length - 2} autre(s)</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold whitespace-nowrap">
                                {formatCurrency(cmd.total)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={st.color}>{st.label}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {cmd.statut === "validee" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isLoading}
                                      onClick={() => handleChangeStatut(cmd, "en_cours")}
                                    >
                                      <Truck className="h-3.5 w-3.5 mr-1" />
                                      Préparer
                                    </Button>
                                  )}
                                  {cmd.statut !== "livree" && (
                                    <Button
                                      size="sm"
                                      onClick={() => openBLDialog(cmd)}
                                    >
                                      <Printer className="h-3.5 w-3.5 mr-1" />
                                      BL / Fiche
                                    </Button>
                                  )}
                                  {cmd.statut === "en_cours" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-700 border-green-300 hover:bg-green-50"
                                      disabled={isLoading}
                                      onClick={() => handleChangeStatut(cmd, "livree")}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                      Livré
                                    </Button>
                                  )}
                                  {cmd.statut === "livree" && (
                                    <Button size="sm" variant="outline" onClick={() => openBLDialog(cmd)}>
                                      <Printer className="h-3.5 w-3.5 mr-1" />
                                      Réimprimer
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}

export default LivraisonsPage;
