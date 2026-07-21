import { useState, useEffect, useCallback } from "react";
import type { Product, ProductImage } from "@/data/products";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3002/api/v2";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export interface BackendArticle {
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

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY * (attempt + 1)));
    }
  }
}

function mapToProduct(a: BackendArticle): Product {
  let images: ProductImage[] = [];
  if (Array.isArray(a.images) && a.images.length > 0) {
    images = a.images.map((url, i) => ({ url, alt: a.libelle, isPrimary: i === 0 }));
  } else {
    images = [{ url: "", alt: a.libelle, isPrimary: true }];
  }

  const categoryName =
    a.categorie?.categorie ??
    (Array.isArray(a.categories) && a.categories.length > 0
      ? a.categories[0].categorie
      : "Général");

  const banque = (a.banque ?? "").toUpperCase();

  return {
    id: String(a.id),
    name: a.libelle,
    description: a.description ?? "",
    longDescription: a.description ?? "",
    price: 0,
    images,
    category: categoryName,
    banque: banque || undefined,
    // Le stock n'est pas suivi article par article dans ce modèle (vente à
    // financement) : seul le statut décide de la disponibilité à la commande.
    inStock: a.statut !== "rupture",
    stockQuantity: a.quantite ?? 0,
    reference: a.reference ?? "",
    specifications: {
      Marque: a.marque ?? "—",
      Référence: a.reference ?? "—",
      ...(banque ? { Financement: banque } : {}),
    },
    featured: false,
    isNew: false,
    onSale: false,
    tags: [categoryName, a.marque ?? "", banque].filter(Boolean),
  };
}

export function useMarketplaceProducts(searchQuery?: string) {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const load = useCallback(async (cancelled: { value: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const artUrl = searchQuery
        ? `${API_BASE}/public/articles?search=${encodeURIComponent(searchQuery)}`
        : `${API_BASE}/public/articles`;

      const [artRes, catRes] = await Promise.all([
        fetchWithRetry(artUrl),
        fetchWithRetry(`${API_BASE}/public/categories`),
      ]);

      if (cancelled.value) return;

      const articles: BackendArticle[] = Array.isArray(artRes) ? artRes : (artRes.data ?? []);
      const mapped = articles.map(mapToProduct);
      setProducts(mapped);

      const cats = Array.isArray(catRes) ? catRes : (catRes.data ?? []);
      setCategories(
        cats.map((c: { id: number; categorie: string }) => ({
          id: String(c.id),
          label: c.categorie,
        }))
      );
    } catch {
      if (!cancelled.value) setError("Impossible de charger le catalogue. Vérifiez votre connexion.");
    } finally {
      if (!cancelled.value) setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const cancelled = { value: false };
    load(cancelled);
    return () => { cancelled.value = true; };
  }, [load]);

  const refetch = useCallback(() => {
    const cancelled = { value: false };
    load(cancelled);
  }, [load]);

  return { products, categories, loading, error, refetch };
}
