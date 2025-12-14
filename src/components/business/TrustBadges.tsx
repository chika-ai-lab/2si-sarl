import { Shield, Percent, Clock, Truck, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { staggerFadeUp } from "@/lib/animations";

interface TrustBadgesProps {
  variant?: "default" | "compact";
  className?: string;
}

const badges = [
  {
    icon: Shield,
    label: "Paiement sécurisé",
    key: "secure",
  },
  {
    icon: Percent,
    label: "0% d'intérêt possible",
    key: "interest",
  },
  {
    icon: Clock,
    label: "Approbation rapide",
    key: "approval",
  },
  {
    icon: Truck,
    label: "Livraison gratuite",
    key: "shipping",
  },
];

export function TrustBadges({
  variant = "default",
  className,
}: TrustBadgesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll(".trust-badge");
      if (items.length) {
        staggerFadeUp(items, { stagger: 0.12, duration: 0.45, delay: 0.06 });
      }
    }
  }, []);
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        {badges.map(({ icon: Icon, label, key }) => (
          <div
            key={key}
            className="flex items-center justify-center text-center gap-1.5 text-primary"
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-wrap items-center justify-center gap-4",
        className
      )}
    >
      {badges.map(({ icon: Icon, label, key }) => (
        <div key={key} className="trust-badge flex items-center gap-2">
          <Icon className="w-5 h-5 shrink-0" />
          <span className="font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

// add animation on mount
const containerRef = null as unknown as React.RefObject<HTMLDivElement>;
// We move the actual ref into the component via closure to avoid TS issues in default export

// Variant for single badge display
interface SingleTrustBadgeProps {
  type: "secure" | "interest" | "approval" | "shipping" | "warranty";
  className?: string;
}

export function SingleTrustBadge({ type, className }: SingleTrustBadgeProps) {
  const badgeConfig = {
    secure: { icon: Shield, label: "Paiement sécurisé" },
    interest: { icon: Percent, label: "0% d'intérêt" },
    approval: { icon: Clock, label: "Approbation rapide" },
    shipping: { icon: Truck, label: "Livraison gratuite" },
    warranty: { icon: Award, label: "Garantie incluse" },
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn("trust-badge inline-flex items-center gap-1.5", className)}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
}
