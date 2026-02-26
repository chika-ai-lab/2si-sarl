import { useState } from "react";
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
  Warehouse, Search, AlertTriangle, Package, TrendingDown, TrendingUp,
  Plus, Minus, RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

type StockStatut = "normal" | "alerte" | "rupture" | "surstock";

interface StockItem {
  id: string;
  reference: string;
  nom: string;
  categorie: string;
  quantite: number;
  seuilAlerte: number;
  seuilSurstock: number;
  prixUnitaire: number;
  entrepot: string;
  derniereModification: string;
}

function getStatut(item: StockItem): StockStatut {
  if (item.quantite === 0) return "rupture";
  if (item.quantite <= item.seuilAlerte) return "alerte";
  if (item.quantite >= item.seuilSurstock) return "surstock";
  return "normal";
}

const STATUT_CONFIG: Record<StockStatut, { label: string; color: string; icon: React.ElementType }> = {
  normal:   { label: "Normal",    color: "bg-green-100 text-green-800",  icon: Package },
  alerte:   { label: "Alerte",    color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  rupture:  { label: "Rupture",   color: "bg-red-100 text-red-800",     icon: TrendingDown },
  surstock: { label: "Surstock",  color: "bg-blue-100 text-blue-800",   icon: TrendingUp },
};

const INITIAL_STOCK: StockItem[] = [
  { id: "sk-001", reference: "PC-PRO-001", nom: "Ordinateur Portable Pro", categorie: "Informatique", quantite: 24, seuilAlerte: 5, seuilSurstock: 50, prixUnitaire: 850000, entrepot: "Principal", derniereModification: "2025-01-20" },
  { id: "sk-002", reference: "IMP-MF-002", nom: "Imprimante Multifonction", categorie: "Impression", quantite: 3, seuilAlerte: 5, seuilSurstock: 30, prixUnitaire: 800000, entrepot: "Principal", derniereModification: "2025-01-22" },
  { id: "sk-003", reference: "ECR-27-003", nom: "Écran 27\" QHD", categorie: "Affichage", quantite: 0, seuilAlerte: 3, seuilSurstock: 25, prixUnitaire: 185000, entrepot: "Principal", derniereModification: "2025-01-18" },
  { id: "sk-004", reference: "SRV-NAS-004", nom: "Serveur NAS 4 baies", categorie: "Stockage", quantite: 8, seuilAlerte: 2, seuilSurstock: 15, prixUnitaire: 1500000, entrepot: "Secondaire", derniereModification: "2025-01-19" },
  { id: "sk-005", reference: "SW-24P-005", nom: "Switch 24 ports Gigabit", categorie: "Réseau", quantite: 65, seuilAlerte: 5, seuilSurstock: 50, prixUnitaire: 500000, entrepot: "Principal", derniereModification: "2025-01-15" },
  { id: "sk-006", reference: "UPS-1KVA-006", nom: "Onduleur 1 KVA", categorie: "Alimentation", quantite: 12, seuilAlerte: 3, seuilSurstock: 20, prixUnitaire: 350000, entrepot: "Principal", derniereModification: "2025-01-21" },
  { id: "sk-007", reference: "CAB-CAT6-007", nom: "Câble Cat6 (boîte 305m)", categorie: "Réseau", quantite: 2, seuilAlerte: 5, seuilSurstock: 30, prixUnitaire: 120000, entrepot: "Principal", derniereModification: "2025-01-23" },
  { id: "sk-008", reference: "TEL-IP-008", nom: "Téléphone IP HD", categorie: "Téléphonie", quantite: 18, seuilAlerte: 5, seuilSurstock: 40, prixUnitaire: 95000, entrepot: "Secondaire", derniereModification: "2025-01-17" },
];

export function InventoryPage() {
  const [stock, setStock]         = useState<StockItem[]>(INITIAL_STOCK);
  const [search, setSearch]       = useState("");
  const [statutFilter, setStatutFilter] = useState<StockStatut | "all">("all");
  const [isAjustOpen, setIsAjustOpen]   = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [ajustQty, setAjustQty]   = useState("");
  const [ajustType, setAjustType] = useState<"entree" | "sortie">("entree");

  const filtered = stock.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.nom.toLowerCase().includes(q) || s.reference.toLowerCase().includes(q);
    const matchStatut = statutFilter === "all" || getStatut(s) === statutFilter;
    return matchSearch && matchStatut;
  });

  const stats = {
    total:    stock.length,
    alerte:   stock.filter((s) => getStatut(s) === "alerte").length,
    rupture:  stock.filter((s) => getStatut(s) === "rupture").length,
    valeur:   stock.reduce((sum, s) => sum + s.quantite * s.prixUnitaire, 0),
  };

  const openAjust = (item: StockItem) => {
    setSelectedItem(item);
    setAjustQty("");
    setAjustType("entree");
    setIsAjustOpen(true);
  };

  const handleAjust = () => {
    const qty = parseInt(ajustQty);
    if (!qty || qty <= 0 || !selectedItem) {
      toast({ title: "Quantité invalide", variant: "destructive" });
      return;
    }
    setStock((prev) =>
      prev.map((s) => {
        if (s.id !== selectedItem.id) return s;
        const delta = ajustType === "entree" ? qty : -qty;
        const newQty = Math.max(0, s.quantite + delta);
        return { ...s, quantite: newQty, derniereModification: new Date().toISOString().split("T")[0] };
      })
    );
    toast({
      title: ajustType === "entree" ? `+${qty} unités ajoutées` : `-${qty} unités sorties`,
      description: selectedItem.nom,
    });
    setIsAjustOpen(false);
  };

  return (
    <>
      <Dialog open={isAjustOpen} onOpenChange={setIsAjustOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajustement de stock</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium">{selectedItem.nom}</p>
                <p className="text-muted-foreground">Stock actuel: <span className="font-semibold">{selectedItem.quantite} unités</span></p>
              </div>
              <div>
                <Label>Type de mouvement</Label>
                <Select value={ajustType} onValueChange={(v) => setAjustType(v as "entree" | "sortie")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">Entrée de stock</SelectItem>
                    <SelectItem value="sortie">Sortie de stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={ajustQty}
                  onChange={(e) => setAjustQty(e.target.value)}
                  placeholder="Ex: 10"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAjustOpen(false)}>Annuler</Button>
            <Button
              onClick={handleAjust}
              className={ajustType === "entree" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {ajustType === "entree" ? <><Plus className="mr-1 h-4 w-4" />Entrée</> : <><Minus className="mr-1 h-4 w-4" />Sortie</>}
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
                <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence / Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Seuil alerte</TableHead>
                  <TableHead className="text-right">Valeur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const statut = getStatut(item);
                  const cfg = STATUT_CONFIG[statut];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.nom}</p>
                        <p className="text-xs font-mono text-muted-foreground">{item.reference}</p>
                      </TableCell>
                      <TableCell className="text-sm">{item.categorie}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.entrepot}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-lg ${statut === "rupture" ? "text-red-600" : statut === "alerte" ? "text-yellow-600" : ""}`}>
                          {item.quantite}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{item.seuilAlerte}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.quantite * item.prixUnitaire)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cfg.color}>
                          <Icon className="mr-1 h-3 w-3" />{cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openAjust(item)}>
                          <RefreshCw className="mr-1 h-3 w-3" />Ajuster
                        </Button>
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
