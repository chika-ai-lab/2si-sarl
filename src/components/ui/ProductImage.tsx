import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  /** true pour l'image d'en-tête d'une page : chargement immédiat au lieu de lazy */
  priority?: boolean;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
}

/**
 * Image produit : diffère le chargement des images hors écran et décode hors du
 * thread principal. Les fichiers de public/images sont déjà redimensionnés à
 * 1200px et recompressés (cf. scripts/optimize-images.js).
 */
export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  onError,
  onLoad,
}: ProductImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={onError}
      onLoad={onLoad}
      className={cn(className)}
    />
  );
}
