import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

/**
 * Liste virtualisée — ne rend que les lignes visibles.
 *
 * Les écrans du dashboard rendaient jusqu'à mille lignes d'un coup. Au-delà de
 * quelques centaines, le navigateur peine et le défilement saccade, sur des
 * postes qui ne sont pas des machines de développement.
 *
 * En dessous du seuil, on rend la liste normalement : virtualiser vingt lignes
 * coûte plus cher que ça ne rapporte, et casse Ctrl+F sur le contenu.
 */

const SEUIL_VIRTUALISATION = 60;

interface VirtualListProps<T> {
  items: T[];
  /** Hauteur estimée d'une ligne, en pixels — ajustée après mesure réelle. */
  hauteurEstimee: number;
  renderItem: (item: T, index: number) => ReactNode;
  cle: (item: T, index: number) => string | number;
  /** Hauteur de la zone de défilement. */
  className?: string;
  /** Espacement vertical entre les lignes, en pixels. */
  espacement?: number;
  vide?: ReactNode;
}

export function VirtualList<T>({
  items,
  hauteurEstimee,
  renderItem,
  cle,
  className,
  espacement = 8,
  vide,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => hauteurEstimee + espacement,
    overscan: 8,
  });

  if (items.length === 0) return <>{vide ?? null}</>;

  // Listes courtes : rendu direct, pour garder la recherche du navigateur
  // opérante et éviter un conteneur à défilement inutile.
  if (items.length < SEUIL_VIRTUALISATION) {
    return (
      <div className="flex flex-col" style={{ gap: espacement }}>
        {items.map((item, i) => (
          <div key={cle(item, i)}>{renderItem(item, i)}</div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn("overflow-y-auto", className)}
      style={{ contain: "strict" }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((v) => (
          <div
            key={cle(items[v.index], v.index)}
            data-index={v.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${v.start}px)`,
              paddingBottom: espacement,
            }}
          >
            {renderItem(items[v.index], v.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;
