import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/constants";

const tones: Record<Tone, string> = {
  info: "bg-navy-50 text-navy-700 ring-navy-200",
  warning: "bg-gold-50 text-gold-600 ring-gold-200",
  danger: "bg-crimson-50 text-crimson-600 ring-crimson-200",
  success: "bg-turquoise-50 text-turquoise-600 ring-turquoise-300/60",
  muted: "bg-sand-100 text-muted ring-sand-300",
};

export function Badge({ tone = "info", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function StatusBadge({ map, value }: { map: Record<string, { label: string; tone: Tone }>; value: string }) {
  const item = map[value] ?? { label: value, tone: "muted" as Tone };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}
