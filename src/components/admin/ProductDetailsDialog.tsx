import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Package, Tag, DollarSign, Layers, Image as ImageIcon, Star, X } from "lucide-react";
import { useState } from "react";

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    description: string;
    reference: string;
    category: string;
    price: number;
    stockQuantity?: number;
    inStock: boolean;
    images: ProductImage[];
    tags?: string[];
    rating?: number;
    isNew?: boolean;
    isBestSeller?: boolean;
  } | null;
  onEdit?: (product: any) => void;
}

export function ProductDetailsDialog({
  open,
  onOpenChange,
  product,
  onEdit,
}: ProductDetailsDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const categoryLabels: Record<string, string> = {
    electronics: "Électronique",
    furniture: "Mobilier",
    kitchen: "Équipement de cuisine",
    office: "Fournitures de bureau",
    tools: "Outils",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl">{product.name}</span>
            <div className="flex items-center gap-2">
              {product.isNew && (
                <Badge className="bg-blue-100 text-blue-800">Nouveau</Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-orange-100 text-orange-800">Best Seller</Badge>
              )}
              {product.inStock ? (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  En stock
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  Rupture
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images Gallery */}
          <div className="space-y-3">
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
              {product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex]?.url}
                  alt={product.images[currentImageIndex]?.alt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-20 w-20" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Price */}
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Prix</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </div>
              </div>

              {/* Reference & Category */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Référence</p>
                    <p className="font-mono font-semibold">{product.reference}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Layers className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <p className="font-semibold capitalize">
                      {categoryLabels[product.category] || product.category}
                    </p>
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Stock disponible</p>
                    <p className="font-semibold">
                      {product.inStock
                        ? product.stockQuantity
                          ? `${product.stockQuantity} unités`
                          : "Disponible"
                        : "Rupture de stock"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-muted/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Product ID */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">ID Produit</p>
                <p className="font-mono text-sm">{product.id}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            {onEdit && (
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  onEdit(product);
                  onOpenChange(false);
                }}
              >
                Modifier le produit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
