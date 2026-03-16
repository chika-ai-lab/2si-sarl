import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Save, Tag } from "lucide-react";
import { Promotion, getActivePromotions, LOCAL_STORAGE_PROMO_KEY } from "@/config/promotions.config";

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    // Charger les promotions depuis la config au montage
    useEffect(() => {
        // La méthode getActivePromotions ou getAllPromotions
        // va charger depuis le localStorage si disponible.
        // Pour simplifier, importons un helper de config modifié ou recréons ici.
        const loadPromos = async () => {
            // Nous allons d'abord charger TOUTES les promos (même inactives)
            const { promotionsConfig } = await import("@/config/promotions.config");

            const savedConfig = localStorage.getItem(LOCAL_STORAGE_PROMO_KEY);
            if (savedConfig) {
                try {
                    const parsed = JSON.parse(savedConfig);
                    setPromotions(parsed.promotions);
                    return;
                } catch (e) {
                    console.error("Invalid saved promo config", e);
                }
            }
            setPromotions(promotionsConfig.promotions);
        };

        loadPromos();
    }, []);

    const handleToggle = (id: string, enabled: boolean) => {
        setPromotions(prev =>
            prev.map(p => p.id === id ? { ...p, enabled } : p)
        );
    };

    const handleDateChange = (id: string, field: "startDate" | "endDate", value: string) => {
        setPromotions(prev =>
            prev.map(p => p.id === id ? { ...p, [field]: value || undefined } : p)
        );
    };

    const handleSave = () => {
        const newConfig = {
            promotions
        };
        localStorage.setItem(LOCAL_STORAGE_PROMO_KEY, JSON.stringify(newConfig));
        toast({
            title: "Succès",
            description: "La configuration des promotions a été mise à jour.",
        });
        // Optionnel: Déclencher un custom event pour que les composants front-end sachent de re-render
        window.dispatchEvent(new Event("promotions_updated"));
    };

    return (
        <div className="space-y-6">
            {/* En-tête de page */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Tag className="h-8 w-8 text-amber-500" />
                        Gestion des Bannières
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Activez et planifiez les bannières promotionnelles visibles par vos clients.
                    </p>
                </div>
                <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Enregistrer les modifications
                </Button>
            </div>

            {/* Liste des promotions */}
            <div className="grid gap-6">
                {promotions.map((promo) => (
                    <Card key={promo.id} className={`border-l-4 ${promo.enabled ? "border-l-green-500" : "border-l-secondary"} shadow-sm hover:shadow transition-shadow`}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <span className="text-2xl" aria-hidden="true" dangerouslySetInnerHTML={{ __html: promo.title.fr.split(' ')[0] }}></span>
                                    {promo.title.fr.replace(/^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2B05|\u2B06|\u2B07|\u2B1B|\u2B1C|\u2B50|\u2B55|\u231A|\u231B|\u2328|\u23CF|[\u23E9-\u23F3]|[\u23F8-\u23FA]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])\s*/, "")}
                                </CardTitle>
                                <CardDescription className="mt-2 text-base">
                                    {promo.description?.fr || "Aucune description (bannière simple)."}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Label htmlFor={`enable-${promo.id}`} className="font-semibold text-sm">
                                    {promo.enabled ? "Actif" : "Inactif"}
                                </Label>
                                <Switch
                                    id={`enable-${promo.id}`}
                                    checked={promo.enabled}
                                    onCheckedChange={(checked) => handleToggle(promo.id, checked)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4 mt-2">
                                <div className="space-y-2 relative">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                        Date de début
                                    </Label>
                                    <Input
                                        type="date"
                                        value={promo.startDate || ""}
                                        onChange={(e) => handleDateChange(promo.id, "startDate", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                        Date de fin
                                    </Label>
                                    <Input
                                        type="date"
                                        value={promo.endDate || ""}
                                        onChange={(e) => handleDateChange(promo.id, "endDate", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Preview Box */}
                            <div className="mt-6 rounded-md p-4 flex items-center justify-center opacity-80 border" style={{ backgroundColor: promo.backgroundColor || '#eee', color: promo.textColor || '#000' }}>
                                <p className="font-semibold">{promo.title.fr}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
