import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { printElement } from "@/lib/print";

interface Ligne {
  designation: string;
  quantite: number;
  prix: number;
  montant: number;
}

interface CF {
  id: number;
  date: string;
  montant: number;
  etat: string;
  note: string | null;
  fournisseur?: { id: number; nomComplet: string; adresse?: string; telephone?: string; email?: string };
  lignes: Ligne[];
}

interface Props { cf: CF; onClose: () => void; }

export default function BonFournisseur({ cf, onClose }: Props) {
  const ref = `CF-${String(cf.id).padStart(4, "0")}`;
  const dateStr = cf.date
    ? new Date(cf.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const total = cf.lignes.reduce((s, l) => s + Number(l.montant), 0) || Number(cf.montant);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">Bon Fournisseur — {ref}</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => printElement("doc-bon-fournisseur", `Bon Fournisseur ${ref}`)}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>

      {/* Aperçu */}
      <div className="p-6 overflow-y-auto max-h-[75vh]">
        <div id="doc-bon-fournisseur" className="bg-white text-sm max-w-2xl mx-auto space-y-5">

          {/* En-tête */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">2SI SARL</p>
              <p className="text-xs text-gray-500">Équipements Professionnels</p>
              <p className="text-xs text-gray-500">Tel: 33 XXX XX XX</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Bon de Commande Fournisseur</p>
              <p className="text-xs text-gray-500">Réf : {ref}</p>
              <p className="text-xs text-gray-500">Date : {dateStr}</p>
            </div>
          </div>

          {/* Fournisseur */}
          <div className="border rounded p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Fournisseur</p>
            <p className="font-bold">{cf.fournisseur?.nomComplet || "—"}</p>
            {cf.fournisseur?.adresse   && <p className="text-xs">{cf.fournisseur.adresse}</p>}
            {cf.fournisseur?.telephone && <p className="text-xs">Tél : {cf.fournisseur.telephone}</p>}
            {cf.fournisseur?.email     && <p className="text-xs">Email : {cf.fournisseur.email}</p>}
          </div>

          {/* Tableau */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Désignation</th>
                <th className="border border-gray-300 p-2 text-center w-14">Qté</th>
                <th className="border border-gray-300 p-2 text-right w-28">Prix unit.</th>
                <th className="border border-gray-300 p-2 text-right w-28">Montant</th>
              </tr>
            </thead>
            <tbody>
              {cf.lignes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-gray-300 p-3 text-center text-gray-400">
                    Aucun article
                  </td>
                </tr>
              ) : cf.lignes.map((l, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{l.designation}</td>
                  <td className="border border-gray-300 p-2 text-center">{l.quantite}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(Number(l.prix))}</td>
                  <td className="border border-gray-300 p-2 text-right font-medium">{formatCurrency(Number(l.montant))}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={3} className="border border-gray-300 p-2 text-right font-bold">Total</td>
                <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>

          {cf.note && <p className="text-xs text-gray-500 italic">Note : {cf.note}</p>}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-10 pt-8">
            <div className="border-t pt-2 text-xs text-gray-400">Signature responsable 2SI</div>
            <div className="border-t pt-2 text-xs text-gray-400">Cachet & signature fournisseur</div>
          </div>
        </div>
      </div>
    </div>
  );
}
