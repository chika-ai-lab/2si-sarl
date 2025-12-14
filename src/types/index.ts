import { LucideIcon } from "lucide-react";

export interface CategoryCardProps {
  id: string;
  name: string;
  productCount?: number;
  className?: string;
}

export type CategoryIcons = Record<string, LucideIcon>;

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage: string;
  backgroundPosition?: "left" | "center" | "right";
  textPosition?: "left" | "center" | "right";
  overlay?: "dark" | "light" | "gradient";
}

export interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
}
