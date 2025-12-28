import { useState } from "react";
import { useTranslation } from "@/providers/I18nProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Plus, MoreVertical, Edit, Trash, Eye, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { products } from "@/data/products";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { ProductDetailsDialog } from "@/components/admin/ProductDetailsDialog";
import { ProductImportDialog } from "@/components/admin/ProductImportDialog";
import { toast } from "@/hooks/use-toast";

export function ProductsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [viewProduct, setViewProduct] = useState<any>(null);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProduct = async (data: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Creating product:", data);
    toast({
      title: "Produit créé",
      description: "Le produit a été ajouté avec succès.",
    });
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct({
      name: product.name,
      description: product.description,
      reference: product.reference,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.images[0]?.url || "",
      tags: product.tags?.join(", ") || "",
    });
    setIsFormDialogOpen(true);
  };

  const handleViewProduct = (product: any) => {
    setViewProduct(product);
    setIsDetailsDialogOpen(true);
  };

  const handleEditFromDetails = (product: any) => {
    handleEditProduct(product);
  };

  const handleImportProducts = async (importedProducts: any[]) => {
    // Simulate API call to import products
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Importing products:", importedProducts);

    toast({
      title: "Importation réussie",
      description: `${importedProducts.length} produit(s) importé(s) avec succès.`,
    });
  };

  return (
    <>
      <ProductFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSubmit={handleCreateProduct}
        initialData={selectedProduct}
        mode={selectedProduct ? "edit" : "create"}
      />

      <ProductDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        product={viewProduct}
        onEdit={handleEditFromDetails}
      />

      <ProductImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportProducts}
      />

      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("admin.products")}
          </h2>
          <p className="text-muted-foreground">
            Gérer le catalogue de produits
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button onClick={() => {
            setSelectedProduct(null);
            setIsFormDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredProducts.length} produit(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.reference}
                  </TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell>
                    {product.inStock ? (
                      <span className="text-sm">
                        {product.stockQuantity || "∞"}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Rupture
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.inStock ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        En stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Rupture
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Supprimer
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

export default ProductsPage;
