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
import { Loader2, Lock, Mail, ArrowLeft, UserCog } from "lucide-react";

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

  // Fonction pour remplir automatiquement avec les identifiants admin
  const fillAdminCredentials = () => {
    form.setValue("email", "admin@2si.sarl");
    form.setValue("password", "admin123");
    toast({
      title: "Identifiants remplis",
      description: "Vous pouvez maintenant vous connecter",
    });
  };

  return (
    <>
      <SEO
        title="Connexion Admin"
        description="Accès administrateur au tableau de bord 2SI"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Connexion Admin</CardTitle>
            <CardDescription>
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
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
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
            <div className="mt-6">
              <p className="text-sm font-semibold text-muted-foreground mb-3 text-center">
                Identifiants de test
              </p>
              <button
                type="button"
                onClick={fillAdminCredentials}
                disabled={isSubmitting}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-primary/5 border-2 border-blue-200 hover:border-primary rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <UserCog className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">
                      Admin Test
                    </p>
                    <p className="text-xs text-muted-foreground">
                      admin@2si.sarl
                    </p>
                  </div>
                  <div className="text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
                    Cliquer pour remplir →
                  </div>
                </div>
              </button>
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
