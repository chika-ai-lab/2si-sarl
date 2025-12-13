import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/providers/CartProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

const orderSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  company: z.string().min(2, "Nom d'entreprise requis"),
  position: z.string().optional(),
  siret: z.string().min(14, "SIRET invalide").max(14, "SIRET invalide"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(5, "Code postal invalide"),
  country: z.string().default("France"),
  message: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function OrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    items,
    getSubtotal,
    getTotal,
    getMonthlyPayment,
    getSelectedPlan,
    clearCart,
  } = useCart();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      siret: "",
      address: "",
      city: "",
      postalCode: "",
      country: "France",
      message: "",
    },
  });

  const subtotal = getSubtotal();
  const total = getTotal();
  const monthly = getMonthlyPayment();
  const plan = getSelectedPlan();

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log("Order submitted:", { ...data, items, plan, total });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast({
      title: t("order.success"),
      description: t("order.successMessage"),
    });

    // Clear cart after successful order
    setTimeout(() => {
      clearCart();
    }, 1000);
  };

  if (items.length === 0 && !isSuccess) {
    navigate("/cart");
    return null;
  }

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("order.success")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t("order.successMessage")}
            </p>
            <Link to="/">
              <Button size="lg">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("order.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("order.subtitle")}
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Info */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-lg text-foreground">
                    {t("order.personalInfo")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.firstName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.lastName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-lg text-foreground">
                    {t("order.contactInfo")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.phone")}</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional Info */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-lg text-foreground">
                    {t("order.professionalInfo")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.company")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.position")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="siret"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>{t("order.fields.siret")}</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678901234" maxLength={14} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>{t("order.fields.address")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.postalCode")}</FormLabel>
                          <FormControl>
                            <Input maxLength={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("order.fields.city")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Message */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("order.fields.message")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Informations complémentaires..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button (Mobile) */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    size="lg"
                    variant="accent"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("order.submitting")}
                      </>
                    ) : (
                      t("order.submit")
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-lg text-foreground">
                  {t("order.summary")}
                </h3>

                {/* Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qté: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                    <span className="text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  {plan && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t("cart.paymentPlan")}</span>
                      <span>{plan.months} mois</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold text-foreground">{t("cart.total")}</span>
                    <span className="font-bold text-lg text-foreground">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  {plan && (
                    <div className="text-right text-xs text-muted-foreground">
                      soit {formatCurrency(monthly)}/{t("payment.monthly")}
                    </div>
                  )}
                </div>

                {/* Submit Button (Desktop) */}
                <div className="hidden lg:block pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    variant="accent"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("order.submitting")}
                      </>
                    ) : (
                      t("order.submit")
                    )}
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
