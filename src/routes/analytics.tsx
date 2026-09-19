import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/AppLayout";
import { InsightList } from "@/components/InsightList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATEGORY_COLORS,
  byCategory,
  formatMoney,
  generateInsights,
  last6Months,
  last7Days,
  lastWeek,
  sum,
  thisMonth,
  thisWeek,
  useExpenses,
} from "@/lib/expenses-store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SmartSpend AI" },
      { name: "description", content: "Category, weekly and monthly spending breakdowns with charts." },
      { property: "og:title", content: "Analytics — SmartSpend AI" },
      { property: "og:description", content: "See where your money goes each week and month." },
    ],
  }),
  component: Analytics,
});

const tooltipStyle = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 },
  itemStyle: { color: "var(--foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
  cursor: { fill: "oklch(1 0 0 / 5%)" },
};

function Analytics() {
  const { expenses, budget } = useExpenses();
  const month = thisMonth(expenses);
  const week = sum(thisWeek(expenses));
  const prevWeek = sum(lastWeek(expenses));
  const cats = byCategory(month).sort((a, b) => b.total - a.total);
  const weekly = last7Days(expenses);
  const monthly = last6Months(expenses);
  const diff = prevWeek > 0 ? Math.round(((week - prevWeek) / prevWeek) * 100) : null;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Patterns behind your spending." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="This week" value={formatMoney(week)} hint={diff === null ? "No data last week" : `${diff >= 0 ? "+" : ""}${diff}% vs last week`} />
        <Summary label="This month" value={formatMoney(sum(month))} hint={`${month.length} expenses`} />
        <Summary
          label="Avg per day (month)"
          value={formatMoney(sum(month) / Math.max(1, new Date().getDate()))}
          hint="Based on days elapsed"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="mb-3 text-lg font-semibold">Category-wise spending</h2>
          {cats.length === 0 ? (
            <NoData />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cats} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" width={80} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => formatMoney(v)} {...tooltipStyle} />
                  <Bar dataKey="total" radius={[0, 8, 8, 0]} maxBarSize={28}>
                    {cats.map((c) => (
                      <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="surface-card p-5">
          <Tabs defaultValue="weekly">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Spending summary</h2>
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="weekly">
              <TrendChart data={weekly} />
            </TabsContent>
            <TabsContent value="monthly">
              <TrendChart data={monthly} color="var(--gold)" />
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <section className="surface-card mt-6 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="size-5 text-gold" />
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>
        <InsightList insights={generateInsights(expenses, budget)} />
      </section>
    </>
  );
}

function TrendChart({ data, color = "var(--primary)" }: { data: { label: string; total: number }[]; color?: string }) {
  if (data.every((d) => d.total === 0)) return <NoData />;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -16, right: 8 }}>
          <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: number) => formatMoney(v)} {...tooltipStyle} />
          <Bar dataKey="total" fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Summary({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function NoData() {
  return <div className="grid h-64 place-items-center text-sm text-muted-foreground">No data yet for this period.</div>;
}
