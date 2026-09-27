import { Building2, GraduationCap, Plane, Stamp } from "lucide-react";
import type { Service } from "@/data/content";
import { cn } from "@/lib/utils";

const icons = { graduation: GraduationCap, passport: Stamp, building: Building2, plane: Plane };

export const accentStyles: Record<Service["accent"], { bg: string; text: string; ring: string; glow: string }> = {
  crimson: { bg: "bg-crimson-50", text: "text-crimson-500", ring: "ring-crimson-100", glow: "from-crimson-500/20" },
  turquoise: { bg: "bg-turquoise-50", text: "text-turquoise-500", ring: "ring-turquoise-100", glow: "from-turquoise-400/25" },
  gold: { bg: "bg-gold-50", text: "text-gold-500", ring: "ring-gold-100", glow: "from-gold-400/25" },
  navy: { bg: "bg-navy-50", text: "text-navy-600", ring: "ring-navy-100", glow: "from-navy-400/20" },
};

export function ServiceIcon({ icon, accent, className }: { icon: Service["icon"]; accent: Service["accent"]; className?: string }) {
  const Icon = icons[icon];
  const a = accentStyles[accent];
  return (
    <span className={cn("grid h-14 w-14 place-items-center rounded-2xl ring-8", a.bg, a.text, a.ring, className)}>
      <Icon className="h-7 w-7" strokeWidth={1.8} />
    </span>
  );
}
