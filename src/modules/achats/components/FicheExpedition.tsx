import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/modules/commercial/services/apiClient";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printElement } from "@/lib/print";

interface Props { blId: number; onClose: () => void; }

export default function FicheExpedition({ blId, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["bl-print", blId],
    queryFn: () => apiClient.get<any>(`/bordereau-livraisons/${blId}/print`),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const { bl, client, commercial, produits = [] } = data ?? {};
  const ref = bl?.num || `BL-${String(blId).padStart(4, "0")}`;
  const dateStr = bl?.date
    ? new Date(bl.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">Fiche d'Expédition — {ref}</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => printElement("doc-fiche-expedition", `Fiche Expédition ${ref}`)}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>

      {/* Aperçu */}
      <div className="p-6 overflow-y-auto max-h-[75vh]">
        <div id="doc-fiche-expedition" className="bg-white text-sm max-w-2xl mx-auto space-y-5">

          {/* En-tête */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">2SI SARL</p>
              <p className="text-xs text-gray-500">Équipements Professionnels</p>
              <p className="text-xs text-gray-500">Tel: 33 XXX XX XX</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Fiche d'Expédition</p>
              <p className="text-xs text-gray-500">Réf : {ref}</p>
              <p className="text-xs text-gray-500">Date : {dateStr}</p>
            </div>
          </div>

          {/* Destinataire + Infos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Adressé à</p>
              <p className="font-bold">{client?.nom_complet || "—"}</p>
              {client?.agence_nom && <p className="text-xs">{client.agence_nom}</p>}
              {client?.telephone  && <p className="text-xs">{client.telephone}</p>}
            </div>
            <div className="border rounded p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Informations</p>
              {commercial?.nom_complet && (
                <p className="text-xs">Commercial : <span className="font-medium">{commercial.nom_complet}</span></p>
              )}
              {client?.agence_nom && (
                <p className="text-xs">Agence : <span className="font-medium">{client.agence_nom}</span></p>
              )}
              <p className="text-xs">Statut : <span className="font-medium capitalize">{bl?.etat || "—"}</span></p>
            </div>
          </div>

          {/* Tableau produits */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Désignation</th>
                <th className="border border-gray-300 p-2 text-center w-24">Qté commandée</th>
                <th className="border border-gray-300 p-2 text-center w-24">Qté expédiée</th>
              </tr>
            </thead>
            <tbody>
              {produits.length === 0 ? (
                <tr>
                  <td colSpan={3} className="border border-gray-300 p-4 text-center text-gray-400">
                    Aucun produit associé
                  </td>
                </tr>
              ) : produits.map((p: any, i: number) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{p.designation}</td>
                  <td className="border border-gray-300 p-2 text-center">{p.quantite}</td>
                  <td className="border border-gray-300 p-2 text-center">{p.quantite}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {bl?.note && (
            <p className="text-xs text-gray-500 italic">Adresse livraison : {bl.note}</p>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-10 pt-8">
            <div className="border-t pt-2 text-xs text-gray-400">Signature expéditeur</div>
            <div className="border-t pt-2 text-xs text-gray-400">Signature destinataire</div>
          </div>
        </div>
      </div>
    </div>
  );
}
