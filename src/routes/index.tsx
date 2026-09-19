import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ArrowRight, Lightbulb, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader } from "@/components/AppLayout";
import { CategoryBadge } from "@/components/CategoryBadge";
import { InsightList } from "@/components/InsightList";
import { Progress } from "@/components/ui/progress";
import {
  CATEGORY_COLORS,
  byCategory,
  formatMoney,
  generateInsights,
  sum,
  thisMonth,
  useExpenses,
} from "@/lib/expenses-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SmartSpend AI" },
      { name: "description", content: "Your monthly spending, budget and AI insights at a glance." },
      { property: "og:title", content: "Dashboard — SmartSpend AI" },
      { property: "og:description", content: "Smart expense tracking and budgeting for students." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { expenses, budget } = useExpenses();
  const month = thisMonth(expenses);
  const spent = sum(month);
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const cats = byCategory(month);
  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5);
  const insights = generateInsights(expenses, budget);
  const over = spent > budget;

  return (
    <>
      <PageHeader
        title={`Hello 👋 It's ${format(new Date(), "MMMM")}`}
        subtitle="Here's how your money is moving this month."
        action={
          <Link
            to="/add"
            className="mint-gradient hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] md:inline-flex"
          >
            Add expense <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={TrendingUp} label="Total spent" value={formatMoney(spent)} hint={`${month.length} expenses this month`} />
        <Stat icon={Wallet} label="Monthly budget" value={formatMoney(budget)} hint="Set in Budget" />
        <Stat
          icon={PiggyBank}
          label="Remaining"
          value={formatMoney(remaining)}
          hint={over ? "Over budget" : "Left to spend"}
          tone={over ? "danger" : "gold"}
        />
        <div className="surface-card hero-gradient p-5">
          <p className="text-sm text-muted-foreground">Budget used</p>
          <p className="mt-1 font-display text-3xl font-bold tabular">{pct}%</p>
          <Progress
            value={pct}
            className="mt-3 h-2 bg-background/40"
            indicatorClassName={over ? "bg-destructive" : pct >= 80 ? "bg-gold" : "bg-primary"}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="surface-card p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent expenses</h2>
            <Link to="/expenses" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <Empty />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.description || e.category}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(e.date), "d MMM yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={e.category} />
                    <span className="font-semibold tabular">{formatMoney(e.amount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Spending by category</h2>
          {cats.length === 0 ? (
            <Empty />
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cats} dataKey="total" nameKey="category" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="none">
                      {cats.map((c) => (
                        <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatMoney(v)}
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {cats.map((c) => (
                  <li key={c.category} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.category] }} />
                      {c.category}
                    </span>
                    <span className="tabular text-muted-foreground">{formatMoney(c.total)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <section className="surface-card mt-6 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="size-5 text-gold" />
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>
        <InsightList insights={insights} />
      </section>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "mint",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  tone?: "mint" | "gold" | "danger";
}) {
  const iconTone =
    tone === "danger" ? "bg-destructive/15 text-destructive" : tone === "gold" ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary";
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`grid size-8 place-items-center rounded-lg ${iconTone}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-1 font-display text-2xl font-bold tabular md:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">
      No expenses yet.{" "}
      <Link to="/add" className="text-primary hover:underline">
        Add your first one
      </Link>
      .
    </div>
  );
}
