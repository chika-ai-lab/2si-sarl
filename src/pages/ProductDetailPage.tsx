import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEO } from "@/components/SEO";
import { PaymentPlanSelector } from "@/components/business/PaymentPlanSelector";
import { ProductCard } from "@/components/business/ProductCard";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { products, Product } from "@/data/products";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addItem, items } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("6-months");

  useEffect(() => {
    if (id) {
      const foundProduct = products.find((p) => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        navigate("/catalog");
      }
    }
  }, [id, navigate]);

  if (!product) {
    return null;
  }

  const isProductInCart = items.some((item) => item.product.id === product.id);
  const inWishlist = isInWishlist(product.id);
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const relatedProducts = product.relatedProducts
    ? products.filter((p) => product.relatedProducts?.includes(p.id))
    : products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Produit ajouté",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: "Retiré des favoris",
        description: `${product.name} a été retiré de vos favoris.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Ajouté aux favoris",
        description: `${product.name} a été ajouté à vos favoris.`,
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien du produit a été copié dans le presse-papier.",
      });
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <MainLayout>
      <SEO
        title={product.name}
        description={product.description}
        keywords={`${product.name}, ${product.category}, équipement professionnel, paiement échelonné`}
        image={product.images[0]?.url}
        type="product"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/catalog" className="hover:text-foreground transition-colors">
            Catalogue
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex]?.url}
                alt={product.images[selectedImageIndex]?.alt}
                className="w-full h-full object-contain"
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge variant="default" className="bg-green-500">
                    Nouveau
                  </Badge>
                )}
                {product.onSale && discount > 0 && (
                  <Badge variant="destructive">-{discount}%</Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleWishlist}
                    className={inWishlist ? "text-red-500" : ""}
                  >
                    <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount || 0} avis)
                  </span>
                </div>
              )}

              {/* Reference */}
              <p className="text-sm text-muted-foreground mt-2">
                Référence: {product.reference}
              </p>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              {product.inStock ? (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  En stock
                  {product.stockQuantity && ` (${product.stockQuantity} disponibles)`}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500 text-red-600">
                  Rupture de stock
                </Badge>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Caractéristiques principales</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Payment Plan */}
            <div>
              <h3 className="font-semibold mb-3">Plan de paiement</h3>
              <PaymentPlanSelector
                selectedPlanId={selectedPlanId}
                onPlanChange={setSelectedPlanId}
                amount={product.price * quantity}
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="font-semibold block mb-2">Quantité</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.inStock || isProductInCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isProductInCart ? "Déjà dans le panier" : "Ajouter au panier"}
            </Button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Livraison rapide</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Garantie incluse</p>
              </div>
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Retour gratuit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description détaillée</TabsTrigger>
                <TabsTrigger value="specifications">Spécifications</TabsTrigger>
                {product.reviews && product.reviews.length > 0 && (
                  <TabsTrigger value="reviews">
                    Avis ({product.reviewCount || 0})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {product.longDescription}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {product.reviews && product.reviews.length > 0 && (
                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{review.author}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Achat vérifié
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
