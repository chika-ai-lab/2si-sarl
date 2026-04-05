import { useQueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { toast } from "@/hooks/use-toast";
import type { CommandeLivraison } from "../types";
import { mapCommande } from "../lib/livraisons.helpers";

// ─── Query key (exported so BLDialog and LogistiqueDashboard can share it) ────

export const LOGISTIQUE_COMMANDES_KEY = ["logistique-commandes"] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLivraisonsCommandes() {
  const qc = useQueryClient();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: allRaw = [], isLoading } = useQuery({
    queryKey: LOGISTIQUE_COMMANDES_KEY,
    queryFn: async (): Promise<CommandeLivraison[]> => {
      const res   = await apiClient.get<any>("/commande-clients", { per_page: 100 });
      const items: any[] = Array.isArray(res) ? res : (res?.data ?? []);
      return items.map(mapCommande);
    },
    staleTime: 1000 * 60 * 2,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: LOGISTIQUE_COMMANDES_KEY });

  const setOptimistic = (updater: (old: CommandeLivraison[]) => CommandeLivraison[]) =>
    qc.setQueryData<CommandeLivraison[]>(LOGISTIQUE_COMMANDES_KEY, (old = []) => updater(old));

  // ── Mutations ─────────────────────────────────────────────────────────────

  const changeStatut = async (cmd: CommandeLivraison, newEtat: string) => {
    setOptimistic((old) => old.map((c) => c.id === cmd.id ? { ...c, statut: newEtat } : c));
    try {
      await apiClient.put(`/commande-clients/${cmd.id}`, { etat: newEtat });
      toast({ title: "Statut mis à jour" });
    } catch {
      invalidate();
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  };

  const livrer = async (cmd: CommandeLivraison, modePaiement: string) => {
    setOptimistic((old) => old.map((c) => c.id === cmd.id ? { ...c, statut: "livree", banque: modePaiement } : c));
    try {
      await apiClient.put(`/commande-clients/${cmd.id}`, { etat: "livree", mode_paiement: modePaiement });
      toast({ title: "Commande marquée livrée" });
    } catch {
      invalidate();
      toast({ title: "Erreur lors de la livraison", variant: "destructive" });
    }
  };

  const annuler = async (cmd: CommandeLivraison, notes: string) => {
    try {
      await apiClient.put(`/commande-clients/${cmd.id}`, { etat: "annulee", note: notes || undefined });
      toast({ title: "Commande annulée" });
      invalidate();
    } catch {
      toast({ title: "Erreur lors de l'annulation", variant: "destructive" });
      throw new Error("annulation failed");
    }
  };

  const supprimer = async (cmd: CommandeLivraison) => {
    setOptimistic((old) => old.filter((c) => c.id !== cmd.id));
    try {
      await apiClient.delete(`/commande-clients/${cmd.id}`);
      toast({ title: "Commande supprimée" });
    } catch {
      invalidate();
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  return { allRaw, isLoading, invalidate, changeStatut, livrer, annuler, supprimer };
}
