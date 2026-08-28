import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "../services/apiClient";
import { cn } from "@/lib/utils";

/**
 * État annuel des factures clients, mois par mois.
 *
 * Les chiffres viennent d'une agrégation en base : ils portent sur l'exercice
 * entier, pas sur les lignes chargées à l'écran. Les douze mois sont toujours
 * affichés, y compris vides — un tableau qui saute les mois creux les masque.
 */

interface LigneMois {
  mois: number;
  nombre: number;
  montant: number;
  recu: number;
  creance: number;
  impayees: number;
}

interface EtatMensuel {
  annee: number;
  mois: LigneMois[];
  cumul: Omit<LigneMois, "mois">;
}

const NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function FacturesMensuel() {
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["factures-mensuel", annee],
    queryFn: () => apiClient.get<EtatMensuel>("/facture-clients/mensuel", { annee }),
    staleTime: 1000 * 60 * 5,
  });

  const moisCourant = new Date().getFullYear() === annee ? new Date().getMonth() + 1 : -1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          Factures clients {annee}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Année précédente"
            onClick={() => setAnnee((a) => a - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Année suivante"
            disabled={annee >= new Date().getFullYear()}
            onClick={() => setAnnee((a) => a + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 text-left font-semibold">Mois</th>
                  <th className="px-2 py-2 text-right font-semibold">Factures</th>
                  <th className="px-2 py-2 text-right font-semibold">Émis</th>
                  <th className="px-2 py-2 text-right font-semibold">Encaissé</th>
                  <th className="px-2 py-2 text-right font-semibold">Reliquat</th>
                  <th className="px-2 py-2 text-right font-semibold">Impayées</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(data?.mois ?? []).map((m) => {
                  const vide = m.nombre === 0;
                  return (
                    <tr
                      key={m.mois}
                      className={cn(
                        "hover:bg-muted/30",
                        vide && "text-muted-foreground",
                        m.mois === moisCourant && "bg-primary/5",
                      )}
                    >
                      <td className="px-2 py-2">
                        {NOMS[m.mois - 1]}
                        {m.mois === moisCourant && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-primary">
                            en cours
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{m.nombre || "—"}</td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {vide ? "—" : formatCurrency(m.montant)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                        {m.recu > 0 ? formatCurrency(m.recu) : "—"}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {m.creance > 0
                          ? <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(m.creance)}</span>
                          : "—"}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{m.impayees || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 font-semibold">
                <tr>
                  <td className="px-2 py-2">Total {annee}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{data?.cumul.nombre ?? 0}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(data?.cumul.montant ?? 0)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(data?.cumul.recu ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-red-600 dark:text-red-400">
                    {formatCurrency(data?.cumul.creance ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{data?.cumul.impayees ?? 0}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FacturesMensuel;
