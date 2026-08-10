import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.sen-services.com/api/v2";

export interface MarketplaceCategory {
  id: string;
  /** Libellé exact renvoyé par l'API — c'est lui qui doit partir dans ?categories=. */
  label: string;
  productCount: number;
}

interface BackendCategory {
  id: number;
  categorie: string;
  articles_count?: number;
}

/**
 * Catégories du catalogue public.
 *
 * La navigation doit se construire à partir de cette liste et jamais d'une liste
 * écrite en dur : le filtre du catalogue compare `product.category` au paramètre
 * `?categories=`, donc le moindre écart de libellé renvoie zéro résultat.
 *
 * Passe par React Query pour que l'en-tête, présent sur toutes les pages, ne
 * déclenche qu'une seule requête partagée.
 */
export function useMarketplaceCategories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: async (): Promise<MarketplaceCategory[]> => {
      const res = await fetch(`${API_BASE}/public/categories`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const rows: BackendCategory[] = Array.isArray(json) ? json : (json.data ?? []);

      return rows.map((c) => ({
        id: String(c.id),
        label: c.categorie,
        productCount: c.articles_count ?? 0,
      }));
    },
    staleTime: 1000 * 60 * 10, // le catalogue bouge rarement
  });

  return { categories: data ?? [], loading: isLoading, error };
}
