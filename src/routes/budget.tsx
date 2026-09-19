import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatMoney, sum, thisMonth, useExpenses } from "@/lib/expenses-store";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget — SmartSpend AI" },
      { name: "description", content: "Set your monthly budget and track how much is used and remaining." },
      { property: "og:title", content: "Budget — SmartSpend AI" },
      { property: "og:description", content: "Stay within your monthly limit with clear warnings." },
    ],
  }),
  component: BudgetPage,
});

const PRESETS = [3000, 5000, 8000, 12000];

function BudgetPage() {
  const { budget, setBudget, expenses } = useExpenses();
  const [value, setValue] = useState(String(budget));
  useEffect(() => setValue(String(budget)), [budget]);

  const spent = sum(thisMonth(expenses));
  const remaining = budget - spent;
  const ratio = budget > 0 ? spent / budget : 0;
  const pct = Math.min(100, Math.round(ratio * 100));
  const status = ratio >= 1 ? "over" : ratio >= 0.8 ? "near" : "ok";

  const save = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (Number.isNaN(n) || n <= 0) {
      toast.error("Enter a budget greater than 0.");
      return;
    }
    setBudget(n);
    toast.success(`Monthly budget set to ${formatMoney(n)}`);
  };

  return (
    <>
      <PageHeader title="Monthly budget" subtitle="Decide your limit and let SmartSpend AI keep you honest." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card hero-gradient p-6">
          <p className="text-sm text-muted-foreground">This month</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold tabular">{formatMoney(spent)}</span>
            <span className="text-muted-foreground">of {formatMoney(budget)}</span>
          </div>
          <Progress
            value={pct}
            className="mt-5 h-3 bg-background/40"
            indicatorClassName={status === "over" ? "bg-destructive" : status === "near" ? "bg-gold" : "bg-primary"}
          />
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">{pct}% used</span>
            <span className={`font-semibold tabular ${remaining < 0 ? "text-destructive" : "text-gold"}`}>
              {remaining < 0 ? `${formatMoney(-remaining)} over` : `${formatMoney(remaining)} left`}
            </span>
          </div>

          <div className="mt-5">
            {status === "over" && (
              <Banner icon={XCircle} cls="border-destructive/30 bg-destructive/10 text-destructive" text="You've exceeded your monthly budget. Time to slow down." />
            )}
            {status === "near" && (
              <Banner icon={AlertTriangle} cls="border-gold/30 bg-gold/10 text-gold" text="Heads up — you're within 20% of your budget." />
            )}
            {status === "ok" && (
              <Banner icon={CheckCircle2} cls="border-success/30 bg-success/10 text-success" text="You're comfortably within budget. Nice work." />
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-lg font-semibold">Set your budget</h2>
          <p className="mt-1 text-sm text-muted-foreground">How much do you want to spend per month?</p>
          <form onSubmit={save} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Amount (₹)</Label>
              <Input
                id="budget"
                type="number"
                inputMode="numeric"
                min="0"
                step="100"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-12 text-lg tabular"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue(String(p))}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {formatMoney(p)}
                </button>
              ))}
            </div>
            <Button type="submit" size="lg" className="w-full font-semibold">
              Save budget
            </Button>
          </form>
        </section>
      </div>
    </>
  );
}

function Banner({ icon: Icon, cls, text }: { icon: typeof XCircle; cls: string; text: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${cls}`}>
      <Icon className="size-5 shrink-0" />
      <span className="text-foreground">{text}</span>
    </div>
  );
}
