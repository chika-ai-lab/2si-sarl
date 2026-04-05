import { devConfig } from "@/config/env.config";

interface Props {
  label?: string;
}

export function WipBadge({ label = "En cours de développement" }: Props) {
  if (!devConfig.showWipBadges) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/40">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      {label}
    </span>
  );
}
