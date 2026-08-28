import { useQuery } from "@tanstack/react-query";
import { History, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { cn } from "@/lib/utils";

/**
 * Frise d'un dossier — ce qui s'est passé, quand, et par qui.
 *
 * Le journal d'audit trace les requêtes HTTP ; il ne permet pas de reconstituer
 * la chronologie d'une commande. Cette frise lit la table d'historique, qui
 * enregistre l'état avant et après chaque transition.
 */

export type EntiteHistorisee =
  | "commande_client"
  | "bon_commande"
  | "commande_fournisseur"
  | "bordereau_livraison"
  | "facture_client";

interface EntreeHistorique {
  id: number;
  action: string;
  etatAvant: string | null;
  etatApres: string | null;
  userNom: string | null;
  observation: string | null;
  createdAt: string;
}

const LIBELLE_ETAT: Record<string, string> = {
  brouillon: "Brouillon",
  validee: "Validée",
  en_cours: "Approvisionnement",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
  en_attente: "À expédier",
  expedie: "Expédié",
  livre: "Livré",
  echec: "Échec",
  annule: "Annulé",
};

const libelle = (etat: string | null) => (etat ? LIBELLE_ETAT[etat] ?? etat : "—");

/** Les transitions défavorables se repèrent d'un coup d'œil. */
const estDefavorable = (etat: string | null) =>
  etat === "echec" || etat === "annule" || etat === "annulee";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace(",", " à");
}

export function HistoriqueTimeline({
  entite,
  entiteId,
  titre = "Historique",
}: {
  entite: EntiteHistorisee;
  entiteId: number | string;
  titre?: string;
}) {
  const { data: entrees = [], isLoading } = useQuery({
    queryKey: ["historique", entite, String(entiteId)],
    queryFn: () => apiClient.get<EntreeHistorique[]>(`/historiques/${entite}/${entiteId}`),
    staleTime: 1000 * 30,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-muted-foreground" />
          {titre}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : entrees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun mouvement enregistré. Les changements de statut apparaîtront ici.
          </p>
        ) : (
          <ol className="relative space-y-5 pl-5">
            {/* Filet vertical reliant les jalons */}
            <span
              aria-hidden="true"
              className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-border"
            />
            {entrees.map((e) => (
              <li key={e.id} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full ring-2 ring-background",
                    estDefavorable(e.etatApres) ? "bg-destructive" : "bg-primary",
                  )}
                />
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {e.etatAvant && (
                    <>
                      <span className="text-sm text-muted-foreground">{libelle(e.etatAvant)}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    </>
                  )}
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      estDefavorable(e.etatApres) ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {libelle(e.etatApres)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(e.createdAt)}
                  </span>
                </div>

                {e.observation && (
                  <p className="text-sm text-muted-foreground mt-0.5">{e.observation}</p>
                )}

                {e.userNom && (
                  <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {e.userNom}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default HistoriqueTimeline;
