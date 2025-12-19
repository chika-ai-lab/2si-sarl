import { CategoryIcons, HeroSlide } from "@/types";
import { Monitor, Armchair, Settings, Truck, Wrench } from "lucide-react";

// Icon mapping for categories
export const categoryIcons: CategoryIcons = {
  electronics: Monitor,
  furniture: Armchair,
  equipment: Settings,
  vehicles: Truck,
  tools: Wrench,
};

// Hero Carousel Slides - Customizable
export const heroSlides = (company): HeroSlide[] => [
  {
    id: "slide-1",
    title: company.tagline,
    subtitle: "2SI.Sarl",
    description: company.description,
    ctaText: "Explorer le catalogue",
    ctaLink: "/catalog",
    secondaryCtaText: "En savoir plus",
    secondaryCtaLink: "/catalog",
    backgroundImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
    backgroundPosition: "center",
    textPosition: "left",
    overlay: "gradient",
  },
  {
    id: "slide-2",
    title: "Équipements professionnels de qualité",
    subtitle: "Nouveautés",
    description:
      "Découvrez notre sélection d'équipements informatiques et bureautiques dernière génération.",
    ctaText: "Voir les nouveautés",
    ctaLink: "/catalog?sort=newest",
    secondaryCtaText: "Tous les produits",
    secondaryCtaLink: "/catalog",
    backgroundImage:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&h=1080&fit=crop",
    backgroundPosition: "center",
    textPosition: "left",
    overlay: "gradient",
  },
  {
    id: "slide-3",
    title: "0% d'intérêt sur 6 mois",
    subtitle: "Offre spéciale",
    description:
      "Financez vos équipements sans frais supplémentaires. Paiement échelonné adapté à votre budget.",
    ctaText: "Profiter de l'offre",
    ctaLink: "/catalog",
    secondaryCtaText: "Voir les conditions",
    secondaryCtaLink: "/catalog",
    backgroundImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop",
    backgroundPosition: "center",
    textPosition: "center",
    overlay: "dark",
  },
];
