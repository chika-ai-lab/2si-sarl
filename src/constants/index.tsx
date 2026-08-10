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

/**
 * Normalise un libellé de catégorie en nom de fichier : sans accent, en
 * minuscules, « & » écrit « et », le reste en tirets.
 * « SMARTPHONE & TABLETTE » → « smartphone-et-tablette »
 */
export function slugifyCategory(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // marques diacritiques isolées par NFD
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Visuels de catégories servis depuis public/images/categories.
 *
 * Le libellé renvoyé par l'API et le nom du fichier divergent parfois sur le
 * pluriel (« Informatiques » face à informatique.png) : on propose les deux
 * formes, la carte essaie les candidats dans l'ordre et retombe sur son dégradé
 * de couleur si aucun ne répond. Une nouvelle catégorie est donc illustrée dès
 * qu'on dépose un fichier correctement nommé, sans toucher au code.
 */
export function getCategoryImageCandidates(name: string): string[] {
  const slug = slugifyCategory(name);
  if (!slug) return [];

  const variants = [slug, slug.replace(/s$/, ""), `${slug}s`];
  return [...new Set(variants)].map((v) => `/images/categories/${v}.webp`);
}

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
    secondaryCtaText: "Suis-je éligible ?",
    secondaryCtaLink: "/#eligibilite",
    backgroundImage: "/images/hero/slide1.webp",
    backgroundPosition: "center",
    textPosition: "center",
    overlay: "dark",
  },
  {
    id: "slide-2",
    title: "Les grandes marques, pour la maison et le bureau",
    subtitle: "Nouveautés",
    description:
      "Téléphones, téléviseurs, électroménager, informatique : découvrez les dernières arrivées de notre catalogue.",
    ctaText: "Voir les nouveautés",
    ctaLink: "/catalog?sort=newest",
    secondaryCtaText: "Tous les produits",
    secondaryCtaLink: "/catalog",
    backgroundImage: "/images/hero/slide2.webp",
    backgroundPosition: "center",
    textPosition: "center",
    overlay: "dark",
  },
  {
    id: "slide-3",
    title: "De 6 à 24 mensualités, à votre rythme",
    subtitle: "Particuliers & entreprises",
    description:
      "Choisissez votre produit, choisissez votre durée. Un chargé de clientèle vous accompagne jusqu'à la livraison.",
    ctaText: "Profiter de l'offre",
    ctaLink: "/catalog",
    secondaryCtaText: "Voir les conditions",
    secondaryCtaLink: "/#eligibilite",
    backgroundImage: "/images/hero/slide3.webp",
    backgroundPosition: "center",
    textPosition: "center",
    overlay: "dark",
  },
];
