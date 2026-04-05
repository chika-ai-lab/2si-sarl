import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SEO } from "@/components/SEO";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail, ArrowLeft, UserCog, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour remplir automatiquement les identifiants
  const fillCredentials = (email: string, password: string, role: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
    toast({
      title: "Identifiants remplis",
      description: `Connectez-vous en tant que ${role}`,
    });
  };

  return (
    <>
      <SEO
        title="Connexion Admin"
        description="Accès administrateur au tableau de bord 2SI"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background via-50% to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-all hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <Card className="shadow-2xl border-2 border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50" />
                <Lock className="h-8 w-8 text-primary-foreground relative z-10" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Connexion Admin
            </CardTitle>
            <CardDescription className="text-sm">
              Connectez-vous pour accéder au tableau de bord administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="admin@2si.sarl"
                            className="pl-10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mot de passe
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </Form>

            {/* Demo Credentials - Clickable */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                <p className="text-xs font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-wide">
                  Identifiants de test
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
              </div>
              <div className="space-y-2">
                {/* Administrateur */}
                <button
                  type="button"
                  onClick={() => fillCredentials("admin@2si.sarl", "admin123", "Administrateur")}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 hover:border-red-400 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <UserCog className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-foreground">Administrateur</p>
                      <p className="text-xs text-muted-foreground">Accès total au système</p>
                    </div>
                    <div className="text-xs text-red-600 font-medium group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>

                {/* Comptabilité */}
                <button
                  type="button"
                  onClick={() => fillCredentials("comptabilite@2si.sarl", "compta123", "Comptabilité")}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200 hover:border-blue-400 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <UserCog className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-foreground">Comptabilité</p>
                      <p className="text-xs text-muted-foreground">Finances, commandes, rapports</p>
                    </div>
                    <div className="text-xs text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>

                {/* Commercial */}
                <button
                  type="button"
                  onClick={() => fillCredentials("commercial@2si.sarl", "commercial123", "Commercial")}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-200 hover:border-green-400 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <UserCog className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-foreground">Commercial</p>
                      <p className="text-xs text-muted-foreground">CRM, produits, ventes, commandes</p>
                    </div>
                    <div className="text-xs text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>

                {/* Logistique */}
                <button
                  type="button"
                  onClick={() => fillCredentials("logistique@2si.sarl", "logistique123", "Logistique")}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 border-2 border-orange-200 hover:border-orange-400 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <UserCog className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-foreground">Logistique</p>
                      <p className="text-xs text-muted-foreground">Livraisons, catalogue, fournisseurs</p>
                    </div>
                    <div className="text-xs text-orange-600 font-medium group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 Sen Services International - 2SI.Sarl
        </p>
      </div>
    </div>
    </>
  );
}
