import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/core/auth/providers/AuthProviderV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { SEO } from "@/components/SEO";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Phone, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  telephone: z.string().min(6, "Numéro invalide"),
  password:  z.string().min(6, "Au moins 6 caractères"),
});
type LoginFormData = z.infer<typeof loginSchema>;

// const TEST_USERS = [
//   { role: "Admin",       telephone: "sthiaw@sen-services.com",         name: "Souleynmane Thiaw", color: "red"    },
//   { role: "Commercial",  telephone: "mbarro@sen-services.com",          name: "Mai Barro",         color: "green"  },
//   { role: "Logistique",  telephone: "thiernoba@sen-services.com",       name: "Thierno Ba",        color: "orange" },
//   { role: "Comptable",   telephone: "coura@sen-services.com",           name: "Ndeye Coura Diop",  color: "blue"   },
// ] as const;

const COLOR_MAP = {
  red:    "border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700",
  green:  "border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700",
  orange: "border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-700",
  blue:   "border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700",
};

export function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [isLoading,  setIsLoading]  = useState(false);
  const [showPwd,    setShowPwd]    = useState(false);

  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { telephone: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.telephone, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({ title: "Identifiants incorrects", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fill = (telephone: string, name: string) => {
    form.setValue("telephone", telephone);
    form.setValue("password", "Gestemc@2025");
    toast({ title: `Connecté en tant que ${name}` });
  };

  return (
    <>
      <SEO title="Connexion" noindex={true} />
      <div className="h-screen overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Logo + titre */}
          <div className="text-center mb-4">
            <div className="inline-flex h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center shadow-lg shadow-primary/30 mb-3">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              2SI SARL
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Espace de gestion</p>
          </div>

          <Card className="shadow-xl border border-border/60">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-base font-semibold text-center text-muted-foreground">
                Connexion
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">

              {/* Formulaire */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Téléphone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input {...field} type="tel" placeholder="77 000 00 00" className="pl-9 h-9 text-sm" disabled={isLoading} autoComplete="tel" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPwd ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-9 pr-9 h-9 text-sm"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-9 bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Connexion...</> : "Se connecter"}
                  </Button>
                </form>
              </Form>

              {/* Identifiants de test */}
              {/* <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Comptes de test
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TEST_USERS.map(({ role, telephone, name, color }) => (
                    <button
                      key={telephone}
                      type="button"
                      onClick={() => fill(telephone, name)}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-md border text-left transition-all disabled:opacity-50 ${COLOR_MAP[color]}`}
                    >
                      <p className="text-xs font-semibold leading-tight">{role}</p>
                      <p className="text-[10px] opacity-70 truncate leading-tight mt-0.5">{name}</p>
                    </button>
                  ))}
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                  Mot de passe universel : <span className="font-mono font-semibold">Gestemc@2025</span>
                </p>
              </div> */}

            </CardContent>
          </Card>

          <p className="text-center text-[10px] text-muted-foreground mt-3">
            © 2025 Sen Services International — 2SI SARL
          </p>
        </div>
      </div>
    </>
  );
}
