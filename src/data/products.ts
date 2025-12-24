// Sample product data for demo purposes
// In production, this would come from an API

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  verified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number; // Original price for sale items
  images: ProductImage[]; // Multiple images for gallery
  category: string;
  subCategory?: string;
  inStock: boolean;
  stockQuantity?: number;
  reference: string;
  specifications: Record<string, string>;
  features?: string[]; // Bullet point features
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  rating?: number; // Average rating
  reviewCount?: number;
  reviews?: ProductReview[];
  tags?: string[]; // Searchable tags
  relatedProducts?: string[]; // Product IDs
  promoCode?: string; // Promo code like "christmas", "newyear", etc.
}

export const categories = [
  { id: "all", labelKey: "catalog.categories.all" },
  { id: "electronics", labelKey: "catalog.categories.electronics" },
  { id: "furniture", labelKey: "catalog.categories.furniture" },
  { id: "equipment", labelKey: "catalog.categories.equipment" },
  { id: "vehicles", labelKey: "catalog.categories.vehicles" },
  { id: "tools", labelKey: "catalog.categories.tools" },
];

export const products: Product[] = [
  {
    id: "prod-001",
    name: "Ordinateur Portable Pro",
    description: "Laptop professionnel haute performance pour entreprises",
    longDescription: "Un ordinateur portable conçu pour les professionnels exigeants. Processeur dernière génération, 32GB RAM, SSD 1TB. Parfait pour les tâches intensives et le multitâche. Design fin et léger avec écran OLED 4K pour une qualité d'image exceptionnelle.",
    price: 1243000,
    compareAtPrice: 1505000,
    images: [
      { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop", alt: "Ordinateur Portable Pro - Vue principale", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop", alt: "Ordinateur Portable Pro - Clavier" },
      { url: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&auto=format&fit=crop", alt: "Ordinateur Portable Pro - Écran" },
      { url: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800&auto=format&fit=crop", alt: "Ordinateur Portable Pro - Profil" },
    ],
    category: "electronics",
    inStock: true,
    stockQuantity: 12,
    reference: "LP-PRO-001",
    featured: true,
    onSale: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 24,
    specifications: {
      "Processeur": "Intel Core i9-13900H",
      "Mémoire": "32 GB DDR5",
      "Stockage": "1 TB NVMe SSD",
      "Écran": "15.6\" 4K OLED",
      "Autonomie": "12 heures",
      "Poids": "1.8 kg",
      "Connectique": "2x Thunderbolt 4, HDMI 2.1, USB-A",
    },
    features: [
      "Écran OLED 4K tactile",
      "Certification Intel Evo",
      "Charge rapide 80% en 45 min",
      "Webcam Full HD avec obturateur de confidentialité",
      "Clavier rétro-éclairé avec pavé numérique"
    ],
    tags: ["laptop", "ordinateur", "professionnel", "intel", "oled", "haute-performance"],
    relatedProducts: ["prod-008", "prod-003"],
    promoCode: "christmas", // Promo de Noël
    reviews: [
      {
        id: "rev-001-01",
        author: "Marie D.",
        rating: 5,
        date: "2025-11-15",
        comment: "Excellent laptop pour le développement. Très rapide et l'écran OLED est magnifique. La batterie tient vraiment 12h en usage bureautique.",
        verified: true,
      },
      {
        id: "rev-001-02",
        author: "Ahmed K.",
        rating: 4,
        date: "2025-11-08",
        comment: "Très bon produit, performant et élégant. Seul bémol : un peu bruyant sous charge intensive.",
        verified: true,
      },
      {
        id: "rev-001-03",
        author: "Sophie M.",
        rating: 5,
        date: "2025-10-22",
        comment: "Parfait pour la création graphique. Couleurs précises et puissance au rendez-vous !",
        verified: true,
      },
    ],
  },
  {
    id: "prod-002",
    name: "Bureau Ergonomique Ajustable",
    description: "Bureau électrique réglable en hauteur pour un confort optimal",
    longDescription: "Bureau moderne avec réglage électrique de la hauteur. Surface spacieuse de 160x80cm, système anti-collision, mémorisation de 4 positions. Construction robuste en acier avec plateau en bois massif. Idéal pour alterner position assise et debout durant la journée.",
    price: 523000,
    images: [
      { url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop", alt: "Bureau Ergonomique - Vue principale", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop", alt: "Bureau Ergonomique - Position haute" },
      { url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop", alt: "Bureau Ergonomique - Contrôle" },
    ],
    category: "furniture",
    inStock: true,
    stockQuantity: 8,
    reference: "BE-ERG-002",
    featured: true,
    isNew: false,
    rating: 4.6,
    reviewCount: 18,
    specifications: {
      "Dimensions": "160 x 80 cm",
      "Hauteur": "65-130 cm",
      "Charge max": "120 kg",
      "Moteur": "Dual motor",
      "Garantie": "5 ans",
      "Vitesse": "38mm/s",
      "Niveau sonore": "< 50 dB",
    },
    features: [
      "Réglage électrique silencieux",
      "4 positions mémorisables",
      "Système anti-collision intégré",
      "Plateau en chêne massif",
      "Montage facile en 20 minutes"
    ],
    tags: ["bureau", "ergonomique", "réglable", "électrique", "standing-desk"],
    relatedProducts: ["prod-004"],
    promoCode: "christmas", // Promo de Noël
    reviews: [
      {
        id: "rev-002-01",
        author: "Jean-Paul R.",
        rating: 5,
        date: "2025-11-20",
        comment: "Qualité exceptionnelle ! Le système de mémorisation est très pratique. Je recommande.",
        verified: true,
      },
      {
        id: "rev-002-02",
        author: "Laure B.",
        rating: 4,
        date: "2025-11-05",
        comment: "Très bon bureau, stable même en position haute. Un peu cher mais la qualité est là.",
        verified: false,
      },
    ],
  },
  {
    id: "prod-003",
    name: "Imprimante Multifonction Pro",
    description: "Imprimante laser couleur avec scanner et fax intégrés",
    longDescription: "Solution d'impression complète pour entreprises. Impression recto-verso automatique, connectivité WiFi et Ethernet, capacité papier 500 feuilles. Scanner recto-verso en une passe avec chargeur automatique 50 feuilles.",
    price: 425000,
    images: [
      { url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop", alt: "Imprimante Multifonction - Vue principale", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop", alt: "Imprimante Multifonction - Panneau de contrôle" },
    ],
    category: "electronics",
    inStock: true,
    stockQuantity: 15,
    reference: "IMP-MF-003",
    isNew: false,
    rating: 4.4,
    reviewCount: 12,
    specifications: {
      "Type": "Laser couleur",
      "Vitesse": "35 ppm",
      "Résolution": "1200 x 1200 dpi",
      "Connectivité": "WiFi, Ethernet, USB",
      "Recto-verso": "Automatique",
      "Scanner": "Recto-verso 50 ppm",
      "Capacité papier": "500 feuilles",
    },
    features: [
      "Impression mobile via app",
      "Scanner vers email/cloud",
      "Écran tactile couleur 5 pouces",
      "Économie d'énergie certifiée",
      "Fax couleur 33.6 kbps"
    ],
    tags: ["imprimante", "multifonction", "laser", "couleur", "scanner", "fax"],
    relatedProducts: ["prod-001"],
    promoCode: "christmas", // Promo de Noël
  },
  {
    id: "prod-004",
    name: "Fauteuil Direction Premium",
    description: "Fauteuil de bureau haut de gamme en cuir véritable",
    longDescription: "Fauteuil de direction en cuir pleine fleur. Dossier haut ergonomique, accoudoirs 4D réglables, mécanisme synchrone avec blocage multi-positions. Rembourrage haute densité pour un confort longue durée. Design élégant adapté aux bureaux de direction.",
    price: 850000,
    images: [
      { url: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&auto=format&fit=crop", alt: "Fauteuil Direction - Vue principale", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop", alt: "Fauteuil Direction - Profil" },
      { url: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&auto=format&fit=crop", alt: "Fauteuil Direction - Accoudoirs" },
    ],
    category: "furniture",
    inStock: true,
    stockQuantity: 5,
    reference: "FD-PREM-004",
    featured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 31,
    specifications: {
      "Revêtement": "Cuir pleine fleur",
      "Dossier": "Hauteur ajustable",
      "Accoudoirs": "4D réglables",
      "Charge max": "150 kg",
      "Garantie": "10 ans",
      "Base": "Aluminium poli",
      "Roulettes": "Silencieuses parquet",
    },
    features: [
      "Cuir pleine fleur italien",
      "Appui-tête ajustable",
      "Support lombaire réglable",
      "Mécanisme synchrone premium",
      "Assemblage professionnel inclus"
    ],
    tags: ["fauteuil", "direction", "cuir", "ergonomique", "premium", "luxe"],
    relatedProducts: ["prod-002"],
    reviews: [
      {
        id: "rev-004-01",
        author: "François L.",
        rating: 5,
        date: "2025-11-28",
        comment: "Le meilleur fauteuil que j'ai jamais eu. Confort exceptionnel même après 8h assis. Vaut chaque euro.",
        verified: true,
      },
      {
        id: "rev-004-02",
        author: "Claire D.",
        rating: 5,
        date: "2025-11-12",
        comment: "Qualité irréprochable. Le cuir est magnifique et très confortable. Excellent investissement !",
        verified: true,
      },
      {
        id: "rev-004-03",
        author: "Thomas V.",
        rating: 4,
        date: "2025-10-30",
        comment: "Très bon fauteuil, juste un peu lourd à monter seul. Le résultat final est top.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-005",
    name: "Serveur NAS Enterprise",
    description: "Stockage réseau 8 baies pour données entreprise",
    longDescription: "Serveur NAS haute performance avec 8 baies hot-swap. Processeur Xeon, 64GB RAM ECC, support RAID avancé, 2x ports 10GbE. Solution professionnelle pour sauvegarde et partage de données. Système d'exploitation Linux avec interface web intuitive.",
    price: 2290000,
    images: [
      { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop", alt: "Serveur NAS - Vue principale", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop", alt: "Serveur NAS - Arrière" },
    ],
    category: "equipment",
    inStock: true,
    stockQuantity: 3,
    reference: "SRV-NAS-005",
    isNew: false,
    rating: 4.7,
    reviewCount: 9,
    specifications: {
      "Baies": "8x 3.5\" hot-swap",
      "Processeur": "Intel Xeon E-2234",
      "Mémoire": "64 GB ECC DDR4",
      "Réseau": "2x 10GbE + 2x 1GbE",
      "RAID": "0, 1, 5, 6, 10",
      "Alimentation": "Redondante 550W",
      "OS": "Linux embarqué",
    },
    features: [
      "Hot-swap sans arrêt",
      "Snapshots automatiques",
      "Réplication vers cloud",
      "Antivirus intégré",
      "Support technique 24/7"
    ],
    tags: ["nas", "serveur", "stockage", "raid", "enterprise", "réseau"],
    relatedProducts: ["prod-001"],
  },
  {
    id: "prod-006",
    name: "Chariot Élévateur Électrique",
    description: "Chariot élévateur compact pour entrepôt",
    longDescription: "Chariot élévateur électrique 3 roues, idéal pour les espaces restreints. Capacité 1.6 tonnes, hauteur de levée 4.5m, batterie lithium-ion longue durée. Rayon de braquage réduit pour une maniabilité optimale. Cabine ergonomique avec excellente visibilité.",
    price: 16370000,
    images: [
      { url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop", alt: "Chariot Élévateur - Vue principale", isPrimary: true },
    ],
    category: "vehicles",
    inStock: false,
    stockQuantity: 0,
    reference: "CE-ELEC-006",
    isNew: false,
    rating: 4.5,
    reviewCount: 6,
    specifications: {
      "Capacité": "1.6 tonnes",
      "Hauteur levée": "4.5 m",
      "Batterie": "Lithium-ion 80V",
      "Autonomie": "8 heures",
      "Roues": "3 roues",
      "Rayon braquage": "1.8 m",
      "Vitesse": "16 km/h",
    },
    features: [
      "Batterie lithium sans entretien",
      "Charge rapide en 2h",
      "Cabine suspendue anti-vibration",
      "Caméra de recul intégrée",
      "Formation opérateur incluse"
    ],
    tags: ["chariot", "élévateur", "électrique", "entrepôt", "logistique"],
    relatedProducts: ["prod-007"],
  },
  {
    id: "prod-007",
    name: "Perceuse Colonne Industrielle",
    description: "Perceuse à colonne professionnelle avec variateur",
    longDescription: "Perceuse à colonne haute précision pour ateliers professionnels. Variateur de vitesse électronique, mandrin auto-serrant 20mm, table inclinable. Construction robuste en fonte pour une stabilité optimale et des perçages précis.",
    price: 1243000,
    images: [
      { url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop", alt: "Perceuse Colonne - Vue principale", isPrimary: true },
    ],
    category: "tools",
    inStock: true,
    stockQuantity: 4,
    reference: "PC-IND-007",
    isNew: false,
    rating: 4.3,
    reviewCount: 8,
    specifications: {
      "Puissance": "1500W",
      "Mandrin": "20mm auto-serrant",
      "Vitesse": "150-3000 tr/min",
      "Course": "120mm",
      "Table": "400x400mm",
      "Poids": "180 kg",
      "Garantie": "3 ans",
    },
    features: [
      "Variateur électronique précis",
      "Affichage digital de la vitesse",
      "Étau de serrage inclus",
      "Lumière LED de travail",
      "Plateau orientable ±45°"
    ],
    tags: ["perceuse", "colonne", "industrielle", "atelier", "précision"],
    relatedProducts: ["prod-006"],
  },
  {
    id: "prod-008",
    name: "Écran Moniteur 32\" 4K",
    description: "Moniteur professionnel 32 pouces Ultra HD",
    longDescription: "Moniteur IPS 32 pouces avec résolution 4K UHD. Calibration usine Delta E<2, USB-C 90W, hub USB intégré, hauteur et pivot réglables. Parfait pour la création de contenu, la retouche photo et le travail multi-fenêtres. Certification HDR400.",
    price: 589000,
    compareAtPrice: 719000,
    images: [
      { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop", alt: "Moniteur 32 pouces - Vue principale", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop", alt: "Moniteur 32 pouces - Profil" },
      { url: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop", alt: "Moniteur 32 pouces - Support" },
    ],
    category: "electronics",
    inStock: true,
    stockQuantity: 18,
    reference: "MON-32-008",
    featured: true,
    onSale: true,
    isNew: true,
    rating: 4.7,
    reviewCount: 22,
    specifications: {
      "Taille": "32 pouces",
      "Résolution": "3840 x 2160",
      "Dalle": "IPS",
      "Connectique": "HDMI, DP, USB-C 90W",
      "Calibration": "Delta E < 2",
      "Luminosité": "400 cd/m²",
      "Contraste": "1000:1",
      "Temps de réponse": "5ms",
    },
    features: [
      "USB-C avec charge 90W",
      "Hub USB 4 ports",
      "Pied ergonomique réglable",
      "Mode eye-care anti-fatigue",
      "Garantie pixel parfait 3 ans"
    ],
    tags: ["moniteur", "écran", "4k", "uhd", "professionnel", "usb-c", "ips"],
    relatedProducts: ["prod-001"],
    reviews: [
      {
        id: "rev-008-01",
        author: "David M.",
        rating: 5,
        date: "2025-11-25",
        comment: "Écran parfait pour la retouche photo ! Les couleurs sont fidèles et le USB-C est très pratique.",
        verified: true,
      },
      {
        id: "rev-008-02",
        author: "Emma L.",
        rating: 4,
        date: "2025-11-18",
        comment: "Très bonne qualité d'image. Juste dommage qu'il n'ait pas de haut-parleurs intégrés.",
        verified: true,
      },
    ],
  },
];

// Utility functions

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter(p => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured);
}

export function getNewProducts(): Product[] {
  return products.filter(p => p.isNew);
}

export function getOnSaleProducts(): Product[] {
  return products.filter(p => p.onSale);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.reference.toLowerCase().includes(lowerQuery) ||
      p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getProductRating(productId: string): number {
  const product = getProductById(productId);
  return product?.rating ?? 0;
}

export function getRelatedProducts(productId: string): Product[] {
  const product = getProductById(productId);
  if (!product?.relatedProducts) return [];

  return product.relatedProducts
    .map(id => getProductById(id))
    .filter((p): p is Product => p !== undefined);
}

export function getProductsByPriceRange(min: number, max: number): Product[] {
  return products.filter(p => p.price >= min && p.price <= max);
}

export function getProductsByRating(minRating: number): Product[] {
  return products.filter(p => (p.rating ?? 0) >= minRating);
}

export function getMaxPrice(): number {
  return Math.max(...products.map(p => p.price));
}

export function getMinPrice(): number {
  return Math.min(...products.map(p => p.price));
}

export function getInStockProducts(): Product[] {
  return products.filter(p => p.inStock);
}
