import { useState, useEffect } from "react";
import { FournisseursService, Fournisseur } from "../services/fournisseurs.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCcw, Building2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function FournisseursPage() {
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadFournisseurs = async () => {
        setIsLoading(true);
        try {
            const data = await FournisseursService.getAll();
            setFournisseurs(data);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de charger les fournisseurs.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadFournisseurs(); }, []);

    const filtered = fournisseurs.filter(f =>
        f.nom?.toLowerCase().includes(search.toLowerCase()) ||
        f.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-blue-500" />
                        Fournisseurs
                    </h1>
                    <p className="text-muted-foreground mt-1">Gérez votre annuaire de fournisseurs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadFournisseurs} disabled={isLoading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Fournisseur
                    </Button>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher un fournisseur..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <p className="text-center text-muted-foreground py-12">Chargement...</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Aucun fournisseur trouvé.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(f => (
                        <Card key={f.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{f.nom}</CardTitle>
                                {f.pays && <CardDescription>{f.ville}, {f.pays}</CardDescription>}
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                {f.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        <span>{f.email}</span>
                                    </div>
                                )}
                                {f.telephone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <span>{f.telephone}</span>
                                    </div>
                                )}
                                {f.adresse && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        <span>{f.adresse}</span>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <Button variant="outline" size="sm" className="w-full">Voir détails</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
