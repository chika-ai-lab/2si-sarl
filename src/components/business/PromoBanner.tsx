import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PromoBannerProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  variant?: "primary" | "accent" | "success";
  imageUrl?: string;
  dismissible?: boolean;
  className?: string;
}

const variantClasses = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
};

export function PromoBanner({
  title,
  description,
  ctaText,
  ctaLink,
  variant = "accent",
  imageUrl,
  dismissible = false,
  className,
}: PromoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        variantClasses[variant],
        className
      )}
    >
      <div className="container mx-auto px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">{title}</h3>
            <p className="text-lg opacity-90 mb-4 md:mb-0">{description}</p>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Button
              asChild
              size="lg"
              variant={variant === "primary" ? "secondary" : "outline"}
              className={cn(
                "font-semibold group",
                variant !== "primary" && "bg-white text-foreground hover:bg-white/90"
              )}
            >
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {dismissible && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDismissed(true)}
                className="hover:bg-white/20"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Fermer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Optional background image */}
        {imageUrl && (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden lg:block">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Compact variant for smaller banners
interface CompactPromoBannerProps {
  text: string;
  ctaText: string;
  ctaLink: string;
  className?: string;
}

export function CompactPromoBanner({
  text,
  ctaText,
  ctaLink,
  className,
}: CompactPromoBannerProps) {
  return (
    <div
      className={cn(
        "bg-accent text-accent-foreground rounded-lg px-4 py-3",
        "flex items-center justify-between gap-4",
        className
      )}
    >
      <p className="font-medium text-sm md:text-base">{text}</p>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="bg-white text-foreground hover:bg-white/90 shrink-0"
      >
        <Link to={ctaLink}>{ctaText}</Link>
      </Button>
    </div>
  );
}
