import { useState, useEffect } from "react";
import { CommandesFournisseursService, CommandeFournisseur } from "../services/commandes-fournisseurs.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCcw, ShoppingCart, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { WipBadge } from "@/components/ui/WipBadge";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    brouillon: { label: "Brouillon", icon: Clock, color: "text-gray-500" },
    valide: { label: "Validée", icon: CheckCircle, color: "text-blue-500" },
    recu: { label: "Reçue", icon: CheckCircle, color: "text-green-500" },
    non_recu: { label: "Non reçue", icon: XCircle, color: "text-red-500" },
};

export default function CommandesFournisseursPage() {
    const [commandes, setCommandes] = useState<CommandeFournisseur[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await CommandesFournisseursService.getAll();
            setCommandes(data);
        } catch {
            toast({ title: "Erreur", description: "Impossible de charger les commandes.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleWorkflow = async (id: string, action: "valider" | "recu" | "non-recu") => {
        try {
            if (action === "valider") await CommandesFournisseursService.valider(id);
            else if (action === "recu") await CommandesFournisseursService.marquerRecu(id);
            else await CommandesFournisseursService.marquerNonRecu(id);
            toast({ title: "Succès", description: "Statut mis à jour." });
            load();
        } catch {
            toast({ title: "Erreur", description: "Action impossible.", variant: "destructive" });
        }
    };

    const filtered = commandes.filter(c =>
        String(c.reference || c.id).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <ShoppingCart className="h-8 w-8 text-indigo-500" />
                            Commandes Fournisseurs
                        </h1>
                        <WipBadge label="Lecture seule" />
                    </div>
                    <p className="text-muted-foreground mt-1">Suivi des achats et réceptions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={load} disabled={isLoading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                    <Button><Plus className="h-4 w-4 mr-2" />Nouvelle Commande</Button>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Rechercher..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <Card>
                <CardHeader className="border-b pb-3">
                    <CardTitle>{commandes.length} commande(s)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3">Référence</th>
                                    <th className="px-6 py-3">Statut</th>
                                    <th className="px-6 py-3">Montant Total</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Chargement...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Aucune commande trouvée.</td></tr>
                                ) : (
                                    filtered.map(c => {
                                        const status = STATUS_CONFIG[c.statut || 'brouillon'] || STATUS_CONFIG.brouillon;
                                        const StatusIcon = status.icon;
                                        return (
                                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="px-6 py-4 font-medium">{c.reference || `CMD-${c.id}`}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1 ${status.color}`}>
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{c.montant_total ? `${c.montant_total.toLocaleString()} FCFA` : "—"}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1">
                                                        {(!c.statut || c.statut === "brouillon") && (
                                                            <Button size="sm" variant="outline" onClick={() => handleWorkflow(String(c.id), "valider")}>Valider</Button>
                                                        )}
                                                        {c.statut === "valide" && (
                                                            <>
                                                                <Button size="sm" variant="outline" onClick={() => handleWorkflow(String(c.id), "recu")}>Reçu</Button>
                                                                <Button size="sm" variant="outline" onClick={() => handleWorkflow(String(c.id), "non-recu")}>Non reçu</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
