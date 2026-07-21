import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Remet la vue en haut à chaque changement de page. Sans cela le défilement de
 * la page précédente est conservé et on arrive en plein milieu du contenu.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Neutralise la restauration native du navigateur, qui rejoue la position
    // précédente juste après notre remise à zéro.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
