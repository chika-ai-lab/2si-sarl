import { Star, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProductRating } from "./ProductRating";
import { cn } from "@/lib/utils";
import type { ProductReview } from "@/data/products";

interface ProductReviewsProps {
  reviews: ProductReview[];
  averageRating: number;
  className?: string;
}

export function ProductReviews({
  reviews,
  averageRating,
  className,
}: ProductReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Star className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun avis pour le moment
        </h3>
        <p className="text-muted-foreground">
          Soyez le premier à donner votre avis sur ce produit
        </p>
      </div>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === rating).length;
    const percentage = (count / reviews.length) * 100;
    return { rating, count, percentage };
  });

  return (
    <div className={cn("space-y-8", className)}>
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center text-center p-6 bg-secondary/30 rounded-xl">
          <div className="text-5xl font-bold text-foreground mb-2">
            {averageRating.toFixed(1)}
          </div>
          <ProductRating rating={averageRating} size="lg" showNumber={false} />
          <div className="text-sm text-muted-foreground mt-2">
            Basé sur {reviews.length} avis
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16 text-sm">
                <span className="font-medium">{rating}</span>
                <Star className="w-3.5 h-3.5 rating-star-filled fill-current" />
              </div>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-12 text-sm text-muted-foreground text-right">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Avis clients ({reviews.length})
        </h3>

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {review.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {review.author}
                          </h4>
                          {review.verified && (
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success border-success/20 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Achat vérifié
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(review.date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <ProductRating
                        rating={review.rating}
                        size="sm"
                        showNumber={false}
                      />
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
