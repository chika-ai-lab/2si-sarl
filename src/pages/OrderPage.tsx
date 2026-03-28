import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowLeft, Loader2, MapPin, CreditCard, Info } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEO } from "@/components/SEO";
import { useCart } from "@/providers/CartProvider";
import { toast } from "@/hooks/use-toast";
import { soumettreDemandeMarketplace } from "@/services/demandeService";

// Régions du Sénégal
const REGIONS_SENEGAL = [
  "Dakar", "Thiès", "Diourbel", "Fatick", "Kaolack", "Kaffrine",
  "Saint-Louis", "Louga", "Matam", "Tambacounda", "Kédougou",
  "Kolda", "Sédhiou", "Ziguinchor",
];

const CANAUX_ACQUISITION = [
  { value: "bouche_a_oreille", label: "Bouche à oreille" },
  { value: "google",           label: "Moteur de recherche (Google...)" },
  { value: "facebook",         label: "Facebook / Instagram" },
  { value: "linkedin",         label: "LinkedIn" },
  { value: "recommandation",   label: "Recommandation d'un client" },
  { value: "autre",            label: "Autre" },
];

const orderSchema = z.object({
  nom:               z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom:            z.string().optional(),
  email:             z.string().email("Email invalide"),
  telephone:         z.string().min(9, "Numéro de téléphone invalide"),
  localisation:      z.string().min(1, "Veuillez sélectionner votre région"),
  canal_acquisition: z.string().optional(),
  message:           z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function OrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [reference, setReference]       = useState("");

  const { items, clearCart } = useCart();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      nom: "", prenom: "", email: "", telephone: "",
      localisation: "", canal_acquisition: "", message: "",
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    if (items.length === 0) {
      toast({ title: "Panier vide", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await soumettreDemandeMarketplace({
        ...data,
        articles: items.map((item) => ({
          id:       parseInt(item.id),
          quantite: item.quantity,
        })),
      });

      setReference(result.reference);
      setIsSuccess(true);
      clearCart();
      toast({ title: "Demande envoyée !", description: result.message });
    } catch (err: unknown) {
      toast({
        title:       "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant:     "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Succès ────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-lg mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Demande enregistrée !</h1>
            <p className="text-muted-foreground mb-2">
              Un conseiller 2SI vous contactera sous <strong>24h</strong> avec votre devis personnalisé
              incluant les frais liés à votre localisation.
            </p>
            {reference && (
              <p className="text-sm text-muted-foreground mb-8">
                Référence : <span className="font-mono font-semibold text-primary">{reference}</span>
              </p>
            )}
            <Link to="/">
              <Button size="lg">Retour à l'accueil</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Votre panier est vide.</p>
          <Link to="/catalog"><Button>Explorer le catalogue</Button></Link>
        </div>
      </MainLayout>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────
  return (
    <MainLayout>
      <SEO
        title="Faire une demande"
        description="Soumettez votre demande d'équipement. Un conseiller vous enverra un devis personnalisé sous 24h."
        noindex={true}
      />
      <div className="container mx-auto px-4 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-1">Faire une demande</h1>
        <p className="text-muted-foreground mb-8">
          Complétez vos informations. Un conseiller vous contactera avec un devis adapté à votre situation.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Identité */}
                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <h2 className="font-semibold text-lg">Vos informations</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nom" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="prenom" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="telephone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="tel" placeholder="77 000 00 00" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Localisation — champ clé pour les frais */}
                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">Votre localisation</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Votre région détermine les frais d'expédition et sera prise en compte dans votre devis.
                  </p>
                  <FormField control={form.control} name="localisation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Région <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner votre région..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REGIONS_SENEGAL.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Canal d'acquisition */}
                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <h2 className="font-semibold text-lg">Comment nous avez-vous connu ?</h2>
                  <FormField control={form.control} name="canal_acquisition" render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Optionnel..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CANAUX_ACQUISITION.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Message */}
                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message complémentaire</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Précisions sur votre besoin, délai souhaité..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Bouton mobile */}
                <div className="lg:hidden">
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi...</> : "Envoyer ma demande"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Résumé sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Produits */}
              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h3 className="font-semibold text-lg">Récapitulatif</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qté : {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info devis */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <CreditCard className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-primary font-medium">
                    Le prix et le plan de paiement (6, 12 ou 24 mois) seront calculés et communiqués dans votre devis sous 24h.
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Le prix final inclut les frais d'expédition selon votre région.
                  </p>
                </div>

                {/* Bouton desktop */}
                <div className="hidden lg:block pt-2">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi...</>
                      : "Envoyer ma demande"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
