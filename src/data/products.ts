// Sample product data for demo purposes
// In production, this would come from an API

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  reference: string;
  specifications: Record<string, string>;
  featured?: boolean;
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
    longDescription: "Un ordinateur portable conçu pour les professionnels exigeants. Processeur dernière génération, 32GB RAM, SSD 1TB. Parfait pour les tâches intensives et le multitâche.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop",
    category: "electronics",
    inStock: true,
    reference: "LP-PRO-001",
    featured: true,
    specifications: {
      "Processeur": "Intel Core i9-13900H",
      "Mémoire": "32 GB DDR5",
      "Stockage": "1 TB NVMe SSD",
      "Écran": "15.6\" 4K OLED",
      "Autonomie": "12 heures",
    },
  },
  {
    id: "prod-002",
    name: "Bureau Ergonomique Ajustable",
    description: "Bureau électrique réglable en hauteur pour un confort optimal",
    longDescription: "Bureau moderne avec réglage électrique de la hauteur. Surface spacieuse de 160x80cm, système anti-collision, mémorisation de 4 positions.",
    price: 799,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop",
    category: "furniture",
    inStock: true,
    reference: "BE-ERG-002",
    featured: true,
    specifications: {
      "Dimensions": "160 x 80 cm",
      "Hauteur": "65-130 cm",
      "Charge max": "120 kg",
      "Moteur": "Dual motor",
      "Garantie": "5 ans",
    },
  },
  {
    id: "prod-003",
    name: "Imprimante Multifonction Pro",
    description: "Imprimante laser couleur avec scanner et fax intégrés",
    longDescription: "Solution d'impression complète pour entreprises. Impression recto-verso automatique, connectivité WiFi et Ethernet, capacité papier 500 feuilles.",
    price: 649,
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop",
    category: "electronics",
    inStock: true,
    reference: "IMP-MF-003",
    specifications: {
      "Type": "Laser couleur",
      "Vitesse": "35 ppm",
      "Résolution": "1200 x 1200 dpi",
      "Connectivité": "WiFi, Ethernet, USB",
      "Recto-verso": "Automatique",
    },
  },
  {
    id: "prod-004",
    name: "Fauteuil Direction Premium",
    description: "Fauteuil de bureau haut de gamme en cuir véritable",
    longDescription: "Fauteuil de direction en cuir pleine fleur. Dossier haut ergonomique, accoudoirs 4D réglables, mécanisme synchrone avec blocage multi-positions.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&auto=format&fit=crop",
    category: "furniture",
    inStock: true,
    reference: "FD-PREM-004",
    featured: true,
    specifications: {
      "Revêtement": "Cuir pleine fleur",
      "Dossier": "Hauteur ajustable",
      "Accoudoirs": "4D réglables",
      "Charge max": "150 kg",
      "Garantie": "10 ans",
    },
  },
  {
    id: "prod-005",
    name: "Serveur NAS Enterprise",
    description: "Stockage réseau 8 baies pour données entreprise",
    longDescription: "Serveur NAS haute performance avec 8 baies hot-swap. Processeur Xeon, 64GB RAM ECC, support RAID avancé, 2x ports 10GbE.",
    price: 3499,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop",
    category: "equipment",
    inStock: true,
    reference: "SRV-NAS-005",
    specifications: {
      "Baies": "8x 3.5\" hot-swap",
      "Processeur": "Intel Xeon E-2234",
      "Mémoire": "64 GB ECC DDR4",
      "Réseau": "2x 10GbE + 2x 1GbE",
      "RAID": "0, 1, 5, 6, 10",
    },
  },
  {
    id: "prod-006",
    name: "Chariot Élévateur Électrique",
    description: "Chariot élévateur compact pour entrepôt",
    longDescription: "Chariot élévateur électrique 3 roues, idéal pour les espaces restreints. Capacité 1.6 tonnes, hauteur de levée 4.5m, batterie lithium-ion longue durée.",
    price: 24999,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop",
    category: "vehicles",
    inStock: false,
    reference: "CE-ELEC-006",
    specifications: {
      "Capacité": "1.6 tonnes",
      "Hauteur levée": "4.5 m",
      "Batterie": "Lithium-ion 80V",
      "Autonomie": "8 heures",
      "Roues": "3 roues",
    },
  },
  {
    id: "prod-007",
    name: "Perceuse Colonne Industrielle",
    description: "Perceuse à colonne professionnelle avec variateur",
    longDescription: "Perceuse à colonne haute précision pour ateliers professionnels. Variateur de vitesse électronique, mandrin auto-serrant 20mm, table inclinable.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop",
    category: "tools",
    inStock: true,
    reference: "PC-IND-007",
    specifications: {
      "Puissance": "1500W",
      "Mandrin": "20mm auto-serrant",
      "Vitesse": "150-3000 tr/min",
      "Course": "120mm",
      "Table": "400x400mm",
    },
  },
  {
    id: "prod-008",
    name: "Écran Moniteur 32\" 4K",
    description: "Moniteur professionnel 32 pouces Ultra HD",
    longDescription: "Moniteur IPS 32 pouces avec résolution 4K UHD. Calibration usine Delta E<2, USB-C 90W, hub USB intégré, hauteur et pivot réglables.",
    price: 899,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop",
    category: "electronics",
    inStock: true,
    reference: "MON-32-008",
    specifications: {
      "Taille": "32 pouces",
      "Résolution": "3840 x 2160",
      "Dalle": "IPS",
      "Connectique": "HDMI, DP, USB-C 90W",
      "Calibration": "Delta E < 2",
    },
  },
];

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

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.reference.toLowerCase().includes(lowerQuery)
  );
}
