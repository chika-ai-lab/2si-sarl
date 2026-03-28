import { useState, useEffect } from "react";
import type { Product, ProductImage } from "@/data/products";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

interface BackendArticle {
  id: number;
  libelle: string;
  description?: string | null;
  reference?: string | null;
  marque?: string | null;
  quantite: number;
  statut?: "actif" | "inactif" | "rupture" | null;
  banque?: string | null;
  categorie?: { id: number; categorie: string } | null;
  categories?: { id: number; categorie: string }[] | null;
  images?: string[] | null;
}

function mapToProduct(a: BackendArticle): Product {
  let images: ProductImage[] = [];
  if (Array.isArray(a.images) && a.images.length > 0) {
    images = a.images.map((url, i) => ({ url, alt: a.libelle, isPrimary: i === 0 }));
  } else {
    images = [{ url: "/placeholder-product.png", alt: a.libelle, isPrimary: true }];
  }

  const categoryName =
    a.categorie?.categorie ??
    (Array.isArray(a.categories) && a.categories.length > 0
      ? a.categories[0].categorie
      : "Général");

  return {
    id: String(a.id),
    name: a.libelle,
    description: a.description ?? "",
    longDescription: a.description ?? "",
    price: 0, // prix de vente non affiché sur la marketplace
    images,
    category: categoryName,
    inStock: a.statut !== "rupture" && (a.quantite ?? 0) > 0,
    stockQuantity: a.quantite ?? 0,
    reference: a.reference ?? "",
    specifications: { Marque: a.marque ?? "—", Référence: a.reference ?? "—" },
    featured: false,
    isNew: false,
    onSale: false,
    tags: [categoryName, a.marque ?? ""].filter(Boolean),
  };
}

export function useMarketplaceProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [artRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/public/articles`).then((r) => r.json()),
          fetch(`${API_BASE}/public/categories`).then((r) => r.json()),
        ]);

        if (cancelled) return;

        const articles: BackendArticle[] = artRes.data ?? artRes ?? [];
        const mapped = articles.map(mapToProduct);
        setProducts(mapped);

        const cats = (catRes.data ?? catRes ?? []) as { id: number; categorie: string }[];
        const activeCatNames = new Set(mapped.map((p) => p.category));
        setCategories(
          cats
            .filter((c) => activeCatNames.has(c.categorie))
            .map((c) => ({ id: String(c.id), label: c.categorie }))
        );
      } catch (e) {
        if (!cancelled) setError("Impossible de charger le catalogue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { products, categories, loading, error };
}
