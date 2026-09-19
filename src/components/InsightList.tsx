import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { Insight, InsightTone } from "@/lib/expenses-store";

const TONE: Record<InsightTone, { icon: typeof Info; cls: string }> = {
  positive: { icon: CheckCircle2, cls: "border-success/30 bg-success/10 text-success" },
  warning: { icon: AlertTriangle, cls: "border-gold/30 bg-gold/10 text-gold" },
  danger: { icon: XCircle, cls: "border-destructive/30 bg-destructive/10 text-destructive" },
  info: { icon: Info, cls: "border-primary/30 bg-primary/10 text-primary" },
};

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {insights.map((i, idx) => {
        const { icon: Icon, cls } = TONE[i.tone];
        return (
          <li key={idx} className={`flex gap-3 rounded-xl border p-4 ${cls}`}>
            <Icon className="mt-0.5 size-5 shrink-0" />
            <p className="text-sm leading-relaxed text-foreground">{i.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
