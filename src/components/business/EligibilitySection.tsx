import { Building2, CheckCircle2, FileText, Info, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { primaryPhone, telHref, whatsappHref, whatsappPhones } from "@/config/company.config";
import { useTranslation } from "@/providers/I18nProvider";
import { fadeUpVariant, viewportOptions } from "@/lib/animations";

/**
 * Conditions d'éligibilité et pièces à fournir, segmentées par audience.
 *
 * Les deux parcours n'ont ni les mêmes critères ni les mêmes justificatifs :
 * un salarié est jugé sur la domiciliation de son salaire, une structure sur
 * son enregistrement et son ancienneté d'activité. D'où deux onglets plutôt
 * qu'un discours unique qui brouillerait les deux.
 */

type Audience = "particulier" | "pro";

const AUDIENCES: { id: Audience; icon: typeof UserRound }[] = [
  { id: "particulier", icon: UserRound },
  { id: "pro", icon: Building2 },
];

// Chaque audience expose 3 conditions et 3 pièces. Le moteur i18n ne rend que
// des chaînes : les listes sont donc des clés numérotées, pas des tableaux.
const ITEM_INDEXES = [1, 2, 3] as const;

export function EligibilitySection() {
  const { t } = useTranslation();

  // WhatsApp d'abord : c'est le canal réellement utilisé ici. Sans numéro
  // WhatsApp déclaré, on retombe sur un appel classique.
  // Message d'accroche volontairement générique : il sert de point d'entrée à
  // toutes les offres, le conseiller qualifie ensuite le besoin.
  const contact = whatsappPhones[0];
  const contactHref = contact
    ? whatsappHref(contact, "Bonjour, je voudrais avoir plus d'informations sur cette offre.")
    : telHref(primaryPhone);

  return (
    <section id="eligibilite" className="py-16 bg-background scroll-mt-24">
      <div className="container mx-auto px-4">
        <motion.div
          variants={fadeUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {t("eligibility.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("eligibility.subtitle")}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="particulier" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              {AUDIENCES.map(({ id, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="gap-2 py-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t(`eligibility.${id}.tab`)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {AUDIENCES.map(({ id }) => (
              <TabsContent key={id} value={id} className="mt-6">
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t(`eligibility.${id}.title`)}
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    {t(`eligibility.${id}.description`)}
                  </p>

                  <div className="grid md:grid-cols-2 gap-8">
                    <Criteria
                      icon={ShieldCheck}
                      title={t("eligibility.conditionsTitle")}
                      items={ITEM_INDEXES.map((n) => t(`eligibility.${id}.condition${n}`))}
                    />
                    <Criteria
                      icon={FileText}
                      title={t("eligibility.documentsTitle")}
                      items={ITEM_INDEXES.map((n) => t(`eligibility.${id}.document${n}`))}
                      note={t(`eligibility.${id}.documentsNote`)}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Le conseiller reste la source des chiffres : rien n'est chiffré ici. */}
          <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                {t("eligibility.advisor.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("eligibility.advisor.description")}
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <a
                href={contactHref}
                {...(contact ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {t("eligibility.advisor.cta")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Criteria({
  icon: Icon,
  title,
  items,
  note,
}: {
  icon: typeof ShieldCheck;
  title: string;
  items: string[];
  note?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary shrink-0" />
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
      {note && (
        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {note}
        </p>
      )}
    </div>
  );
}
