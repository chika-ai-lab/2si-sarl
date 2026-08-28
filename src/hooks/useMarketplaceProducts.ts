import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Product, ProductImage } from "@/data/products";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.sen-services.com/api/v2";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export interface BackendArticle {
  id: number;
  libelle: string;
  description?: string | null;
  reference?: string | null;
  marque?: string | null;
  prix?: number | null;
  mensualite_12?: number | null;
  mensualite_24?: number | null;
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
    price: Number(a.prix) || 0,
    mensualite12: a.mensualite_12 != null ? Number(a.mensualite_12) : undefined,
    mensualite24: a.mensualite_24 != null ? Number(a.mensualite_24) : undefined,
    images,
    category: categoryName,
    banque: banque || undefined,
    marque: a.marque?.trim() || undefined,
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

/** Taille de lot : multiple de 2, 3 et 4, donc des grilles toujours complètes. */
const TAILLE_LOT = 24;

/**
 * Catalogue public, chargé par lots.
 *
 * La route renvoyait auparavant l'intégralité du catalogue en une fois. Elle
 * est désormais paginée côté serveur ; on enchaîne les pages à la demande
 * plutôt que de tout réclamer d'un bloc.
 *
 * `products` reste un tableau plat de tout ce qui a été chargé jusqu'ici, pour
 * que les appelants qui n'ont besoin que des premiers éléments — la page
 * d'accueil et ses vedettes — n'aient rien à changer.
 */
export function useMarketplaceProducts(searchQuery?: string) {
  const {
    data,
    isLoading,
    error: queryError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["marketplace", "articles", searchQuery ?? ""],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        per_page: String(TAILLE_LOT),
      });
      if (searchQuery) params.set("search", searchQuery);
      return fetchWithRetry(`${API_BASE}/public/articles?${params}`);
    },
    getNextPageParam: (derniere: any) => {
      const meta = derniere?.meta;
      if (!meta) return undefined; // ancienne forme sans pagination
      return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: catData } = useQuery({
    queryKey: ["marketplace", "categories-hook"],
    queryFn: () => fetchWithRetry(`${API_BASE}/public/categories`),
    staleTime: 1000 * 60 * 10,
  });

  const products: Product[] = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((p: any) => {
      const liste: BackendArticle[] = Array.isArray(p) ? p : (p?.data ?? []);
      return liste.map(mapToProduct);
    });
  }, [data]);

  const categories = useMemo(() => {
    const liste = Array.isArray(catData) ? catData : (catData?.data ?? []);
    return liste.map((c: { id: number; categorie: string }) => ({
      id: String(c.id),
      label: c.categorie,
    }));
  }, [catData]);

  const total = (data?.pages?.[0] as any)?.meta?.total ?? products.length;

  return {
    products,
    categories,
    loading: isLoading,
    error: queryError ? "Impossible de charger le catalogue. Vérifiez votre connexion." : null,
    refetch,
    // Chargement progressif — ignorés par les appelants qui n'en ont pas besoin.
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    total,
  };
}
