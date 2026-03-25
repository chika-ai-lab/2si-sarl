import { CategoryIcons, HeroSlide } from "@/types";
import {
  Monitor, Armchair, Settings, Truck, Wrench,
  Laptop, Printer, Smartphone, Sun, Home, Package,
  Archive, Plug, UtensilsCrossed, Zap, Sofa,
  Phone, Battery, Shield, Wind, Tv,
} from "lucide-react";

// Icon mapping for categories — keyed by category label (name)
export const categoryIcons: CategoryIcons = {
  // legacy string keys
  electronics: Monitor,
  furniture: Armchair,
  equipment: Settings,
  vehicles: Truck,
  tools: Wrench,
};

// Icon + gradient lookup by category label (case-insensitive substring match)
export const categoryMeta: {
  match: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
}[] = [
  { match: "informatique",  icon: Laptop,           gradient: "from-blue-500 to-blue-700",      iconBg: "bg-blue-400/30" },
  { match: "mobilier",      icon: Armchair,          gradient: "from-amber-500 to-orange-600",   iconBg: "bg-amber-400/30" },
  { match: "équipement",    icon: Settings,          gradient: "from-emerald-500 to-teal-700",   iconBg: "bg-emerald-400/30" },
  { match: "véhicule",      icon: Truck,             gradient: "from-slate-500 to-slate-700",    iconBg: "bg-slate-400/30" },
  { match: "outillage",     icon: Wrench,            gradient: "from-orange-500 to-red-600",     iconBg: "bg-orange-400/30" },
  { match: "électronique",  icon: Monitor,           gradient: "from-violet-500 to-purple-700",  iconBg: "bg-violet-400/30" },
  { match: "electronique",  icon: Zap,               gradient: "from-yellow-500 to-amber-600",   iconBg: "bg-yellow-400/30" },
  { match: "solaire",       icon: Sun,               gradient: "from-yellow-400 to-orange-500",  iconBg: "bg-yellow-300/30" },
  { match: "téléphonie",    icon: Smartphone,        gradient: "from-cyan-500 to-blue-600",      iconBg: "bg-cyan-400/30" },
  { match: "accessoire",    icon: Package,           gradient: "from-pink-500 to-rose-600",      iconBg: "bg-pink-400/30" },
  { match: "électroménager",icon: Home,              gradient: "from-lime-500 to-green-600",     iconBg: "bg-lime-400/30" },
  { match: "petit electro", icon: Plug,              gradient: "from-sky-400 to-cyan-600",       iconBg: "bg-sky-400/30" },
  { match: "vaisselle",     icon: UtensilsCrossed,   gradient: "from-teal-400 to-emerald-600",   iconBg: "bg-teal-400/30" },
  { match: "pack",          icon: Archive,           gradient: "from-indigo-500 to-purple-600",  iconBg: "bg-indigo-400/30" },
  { match: "imprimante",    icon: Printer,           gradient: "from-gray-500 to-slate-700",     iconBg: "bg-gray-400/30" },
  { match: "téléphonie",   icon: Phone,             gradient: "from-cyan-500 to-blue-600",      iconBg: "bg-cyan-400/30" },
  { match: "communication",icon: Phone,             gradient: "from-cyan-500 to-sky-700",       iconBg: "bg-cyan-400/30" },
  { match: "énergie",      icon: Battery,           gradient: "from-yellow-400 to-green-600",   iconBg: "bg-yellow-400/30" },
  { match: "solaire",      icon: Sun,               gradient: "from-yellow-400 to-orange-500",  iconBg: "bg-yellow-300/30" },
  { match: "sécurité",     icon: Shield,            gradient: "from-red-500 to-rose-700",       iconBg: "bg-red-400/30" },
  { match: "surveillance", icon: Shield,            gradient: "from-red-500 to-red-700",        iconBg: "bg-red-400/30" },
  { match: "climatisation",icon: Wind,              gradient: "from-sky-400 to-blue-600",       iconBg: "bg-sky-300/30" },
  { match: "ventilation",  icon: Wind,              gradient: "from-sky-400 to-cyan-600",       iconBg: "bg-sky-300/30" },
  { match: "électronique grand",icon: Tv,           gradient: "from-violet-500 to-indigo-700",  iconBg: "bg-violet-400/30" },
];

export function getCategoryMeta(name: string) {
  const lower = name.toLowerCase();
  return (
    categoryMeta.find((m) => lower.includes(m.match)) ?? {
      icon: Settings,
      gradient: "from-primary to-primary/70",
      iconBg: "bg-white/20",
    }
  );
}

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
