import { Shield, Percent, Clock, Truck, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainerVariant, staggerItemVariant } from "@/lib/animations";
import { useTranslation } from "@/providers/I18nProvider";

interface TrustBadgesProps {
  variant?: "default" | "compact";
  className?: string;
}

const badges = [
  {
    icon: Shield,
    labelKey: "trustBadges.secure",
    key: "secure",
  },
  {
    icon: Percent,
    labelKey: "trustBadges.interest",
    key: "interest",
  },
  {
    icon: Clock,
    labelKey: "trustBadges.approval",
    key: "approval",
  },
  {
    icon: Truck,
    labelKey: "trustBadges.shipping",
    key: "shipping",
  },
];

export function TrustBadges({
  variant = "default",
  className,
}: TrustBadgesProps) {
  const { t } = useTranslation();

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        {badges.map(({ icon: Icon, labelKey, key }) => (
          <div
            key={key}
            className="flex items-center justify-center text-center gap-1.5 text-primary"
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{t(labelKey)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainerVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      className={cn(
        "flex flex-wrap items-center justify-center gap-4",
        className
      )}
    >
      {badges.map(({ icon: Icon, labelKey, key }) => (
        <motion.div
          key={key}
          variants={staggerItemVariant}
          className="trust-badge flex items-center gap-2"
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="font-medium">{t(labelKey)}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Variant for single badge display
interface SingleTrustBadgeProps {
  type: "secure" | "interest" | "approval" | "shipping" | "warranty";
  className?: string;
}

export function SingleTrustBadge({ type, className }: SingleTrustBadgeProps) {
  const { t } = useTranslation();

  const badgeConfig = {
    secure: { icon: Shield, labelKey: "trustBadges.secure" },
    interest: { icon: Percent, labelKey: "trustBadges.interest" },
    approval: { icon: Clock, labelKey: "trustBadges.approval" },
    shipping: { icon: Truck, labelKey: "trustBadges.shipping" },
    warranty: { icon: Award, labelKey: "trustBadges.warranty" },
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn("trust-badge inline-flex items-center gap-1.5", className)}
    >
      <Icon className="w-4 h-4" />
      <span>{t(config.labelKey)}</span>
    </div>
  );
}
