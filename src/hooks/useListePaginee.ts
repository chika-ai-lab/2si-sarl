import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import { apiClient } from "@/modules/commercial/services/apiClient";

/**
 * Liste du dashboard chargée par lots.
 *
 * Les écrans demandaient jusqu'à mille lignes en une requête. Le serveur en
 * renvoie au plus 200 : ils affichaient donc une liste tronquée sans le savoir,
 * et sans le dire. Ce hook lit `meta.total`, enchaîne les pages à la demande, et
 * expose de quoi annoncer ce qui n'est pas encore chargé.
 */
export interface ListePagineeOptions {
  /** Filtres transmis au serveur à chaque page. */
  params?: Record<string, string | number | undefined>;
  taille?: number;
  staleTime?: number;
  /** Recharge systématiquement au montage — utile après une action métier. */
  refetchOnMount?: boolean | "always";
}

export function useListePaginee<T>(
  cle: QueryKey,
  url: string,
  options: ListePagineeOptions = {},
) {
  const { params = {}, taille = 50, staleTime = 1000 * 60, refetchOnMount } = options;

  const query = useInfiniteQuery({
    queryKey: [...cle, params, taille],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiClient.get<any>(url, { ...params, page: pageParam, per_page: taille }),
    getNextPageParam: (derniere: any) => {
      const meta = derniere?.meta;
      // Réponse sans pagination : une seule page, rien à enchaîner.
      if (!meta) return undefined;
      return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
    },
    staleTime,
    refetchOnMount,
  });

  const items: T[] = (query.data?.pages ?? []).flatMap((p: any) =>
    Array.isArray(p) ? p : (p?.data ?? []),
  );

  const total: number = (query.data?.pages?.[0] as any)?.meta?.total ?? items.length;

  return {
    items,
    total,
    /** Vrai tant que le serveur a des lignes non chargées. */
    resteACharger: !!query.hasNextPage,
    chargerSuite: query.fetchNextPage,
    chargementSuite: query.isFetchingNextPage,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
