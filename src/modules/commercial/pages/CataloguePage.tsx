import { useState } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, MoreVertical, Eye, Package } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useProduits } from "../hooks/useProduits";
import type { ProduitStatut, BanquePartenaire, ProduitCatalogue } from "../types";

export function CataloguePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string | "all">("all");
  const [statutFilter, setStatutFilter] = useState<ProduitStatut | "all">("all");
  const [activeTab, setActiveTab] = useState<"tous" | "cbao" | "cms">("tous");
  const [selectedProduit, setSelectedProduit] = useState<ProduitCatalogue | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Determine banque filter based on active tab
  const banqueFilter: BanquePartenaire | undefined =
    activeTab === "cbao" ? "CBAO" : activeTab === "cms" ? "CMS" : undefined;

  // Fetch produits with filters
  const { data, isLoading, error } = useProduits({
    page,
    limit,
    search: searchQuery || undefined,
    banque: banqueFilter,
    categorie: categorieFilter !== "all" ? categorieFilter : undefined,
    statut: statutFilter !== "all" ? statutFilter : undefined,
    sortBy: "nom",
    sortOrder: "asc",
  });

  const produits = data?.data || [];
  const pagination = data?.pagination;

  const statusConfig = {
    actif: { label: "En stock", color: "bg-green-100 text-green-800" },
    inactif: { label: "Inactif", color: "bg-gray-100 text-gray-800" },
    rupture: { label: "Rupture", color: "bg-red-100 text-red-800" },
  };

  // Get unique categories
  const categories = [...new Set(produits.map((p) => p.categorie))];

  const handleViewDetails = (produit: ProduitCatalogue) => {
    setSelectedProduit(produit);
    setIsDetailsOpen(true);
  };

  return (
    <>
      {/* Product Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedProduit?.nom}</DialogTitle>
          </DialogHeader>

          {selectedProduit && (
            <div className="space-y-6">
              {/* Product Image/Icon */}
              <div className="bg-muted rounded-lg overflow-hidden">
                {selectedProduit.images && selectedProduit.images.length > 0 ? (
                  <div className="aspect-video relative">
                    <img
                      src={selectedProduit.images[0]}
                      alt={selectedProduit.nom}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Package className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedProduit.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Référence</p>
                    <p className="font-mono font-semibold">{selectedProduit.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <Badge variant="outline">{selectedProduit.categorie}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marque</p>
                    <p className="font-semibold">{selectedProduit.marque}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Garant financier</p>
                    <Badge variant="outline">{selectedProduit.banque}</Badge>
                  </div>
                </div>

                {/* Prix */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix achat</p>
                    <p className="font-semibold">{formatCurrency(selectedProduit.prixAchat)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix vente</p>
                    <p className="font-semibold text-lg">{formatCurrency(selectedProduit.prixVente)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marge</p>
                    <p className="font-semibold text-green-600">{formatCurrency(selectedProduit.marge)}</p>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <h3 className="font-semibold mb-2">Stock</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantité</p>
                      <p className="font-semibold">{selectedProduit.stock.quantite} {selectedProduit.stock.unite}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seuil alerte</p>
                      <p className="font-semibold">{selectedProduit.stock.seuilAlerte} {selectedProduit.stock.unite}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge
                        variant="outline"
                        className={statusConfig[selectedProduit.statut].color}
                      >
                        {statusConfig[selectedProduit.statut].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                {selectedProduit.specifications && Object.keys(selectedProduit.specifications).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Spécifications</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedProduit.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-muted rounded">
                          <span className="text-sm text-muted-foreground">{key}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("admin.products")}
          </h2>
          <p className="text-muted-foreground">Catalogue des produits par garant financier</p>
        </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit (nom, référence)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <Select value={categorieFilter} onValueChange={(value) => setCategorieFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select value={statutFilter} onValueChange={(value) => setStatutFilter(value as ProduitStatut | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="actif">En stock</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="rupture">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Tabs CBAO / CMS / Tous */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "tous" | "cbao" | "cms")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tous">Tous les produits</TabsTrigger>
            <TabsTrigger value="cbao">CBAO</TabsTrigger>
            <TabsTrigger value="cms">CMS</TabsTrigger>
          </TabsList>

          <TabsContent value="tous" className="mt-6">
            <ProductsTable
              produits={produits}
              isLoading={isLoading}
              error={error}
              statusConfig={statusConfig}
              pagination={pagination}
              page={page}
              setPage={setPage}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="cbao" className="mt-6">
            <ProductsTable
              produits={produits}
              isLoading={isLoading}
              error={error}
              statusConfig={statusConfig}
              pagination={pagination}
              page={page}
              setPage={setPage}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="cms" className="mt-6">
            <ProductsTable
              produits={produits}
              isLoading={isLoading}
              error={error}
              statusConfig={statusConfig}
              pagination={pagination}
              page={page}
              setPage={setPage}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// Component for displaying products table
function ProductsTable({
  produits,
  isLoading,
  error,
  statusConfig,
  pagination,
  page,
  setPage,
  onViewDetails,
}: any) {
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            Erreur lors du chargement des produits
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

  if (produits.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Aucun produit trouvé</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{pagination?.total || 0} produit(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix vente</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produits.map((produit: ProduitCatalogue) => (
                <TableRow key={produit.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {produit.images && produit.images.length > 0 ? (
                        <img
                          src={produit.images[0]}
                          alt={produit.nom}
                          className="h-10 w-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">{produit.nom}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {produit.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {produit.reference}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {produit.categorie}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(produit.prixVente)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {produit.stock.quantite} {produit.stock.unite}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[produit.statut].color}
                    >
                      {statusConfig[produit.statut].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(produit)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
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

export default CataloguePage;
