import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Parcours logistique d'une commande, du bon de commande à l'encaissement.
 * Le même bandeau apparaît sur chaque page du parcours (bons de commande,
 * commandes fournisseurs, livraisons), toujours au même endroit : en tête du
 * détail déplié. L'utilisateur apprend à le lire une fois.
 */
export const PARCOURS = [
  "Fournisseurs",
  "Frais & facture",
  "Validation",
  "Réception",
  "Expédition",
  "Livraison",
  "Encaissement",
] as const;

export type EtapeParcours = (typeof PARCOURS)[number];

/**
 * - `a_faire` : l'utilisateur a une action à mener maintenant ;
 * - `attente` : on attend un tiers (fournisseur, livreur) ;
 * - `alerte`  : un problème bloque le parcours ;
 * - `termine` : cette partie du parcours est close.
 */
export type TonParcours = "a_faire" | "attente" | "alerte" | "termine";

const TONS: Record<TonParcours, { cadre: string; segment: string; libelle: string }> = {
  a_faire: { cadre: "border-primary/25 bg-primary/5",                         segment: "bg-primary",   libelle: "À faire" },
  attente: { cadre: "border-sky-200 bg-sky-50 dark:bg-sky-950/30",            segment: "bg-sky-500",   libelle: "En attente" },
  alerte:  { cadre: "border-amber-300 bg-amber-50 dark:bg-amber-950/30",      segment: "bg-amber-500", libelle: "Bloqué" },
  termine: { cadre: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30", segment: "bg-emerald-500", libelle: "Terminé" },
};

export function ParcoursBandeau({ etape, ton, consigne, action }: {
  etape: EtapeParcours;
  ton: TonParcours;
  /** Ce qu'il faut faire, en nommant le bouton à utiliser. Une phrase. */
  consigne: string;
  /** Seulement quand l'étape se poursuit sur une autre page. */
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
}) {
  const index = PARCOURS.indexOf(etape);
  const t = TONS[ton];
  const Icone = action?.icon ?? ArrowRight;

  return (
    <div className={cn("rounded-lg border px-4 py-3 space-y-2.5", t.cadre)} role="status">
      {/* Où l'on en est dans tout le parcours */}
      <ol className="flex gap-1" aria-label={`Étape ${index + 1} sur ${PARCOURS.length}`}>
        {PARCOURS.map((nom, i) => (
          <li
            key={nom}
            title={nom}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < index ? "bg-foreground/25" : i === index ? t.segment : "bg-foreground/10",
            )}
          />
        ))}
      </ol>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            Étape {index + 1}/{PARCOURS.length} · {t.libelle}
          </p>
          <p className="text-sm font-medium leading-snug">{etape}</p>
          <p className="text-xs text-muted-foreground leading-snug mt-0.5">{consigne}</p>
        </div>
        {action && (
          <Button size="sm" variant="outline" className="shrink-0 bg-background" onClick={action.onClick}>
            {action.label}
            <Icone className="h-4 w-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
