import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";

export const CATEGORIES = ["Food", "Travel", "Education", "Shopping", "Bills", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // yyyy-MM-dd
  description: string;
  createdAt: number;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "var(--chart-1)",
  Travel: "var(--chart-3)",
  Education: "var(--chart-4)",
  Shopping: "var(--chart-2)",
  Bills: "var(--chart-5)",
  Other: "var(--chart-6)",
};

const EXPENSES_KEY = "smartspend:expenses";
const BUDGET_KEY = "smartspend:budget";
const DEFAULT_BUDGET = 8000;

interface StoreValue {
  ready: boolean;
  expenses: Expense[];
  budget: number;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, e: Omit<Expense, "id" | "createdAt">) => void;
  deleteExpense: (id: string) => void;
  setBudget: (b: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState<number>(DEFAULT_BUDGET);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EXPENSES_KEY);
      if (raw) setExpenses(JSON.parse(raw));
      const b = window.localStorage.getItem(BUDGET_KEY);
      if (b) setBudgetState(Number(b));
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses, ready]);

  useEffect(() => {
    if (ready) window.localStorage.setItem(BUDGET_KEY, String(budget));
  }, [budget, ready]);

  const addExpense = useCallback((e: Omit<Expense, "id" | "createdAt">) => {
    setExpenses((prev) => [{ ...e, id: uid(), createdAt: Date.now() }, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, e: Omit<Expense, "id" | "createdAt">) => {
    setExpenses((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x)));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const setBudget = useCallback((b: number) => setBudgetState(Math.max(0, b)), []);

  const value = useMemo(
    () => ({ ready, expenses, budget, addExpense, updateExpense, deleteExpense, setBudget }),
    [ready, expenses, budget, addExpense, updateExpense, deleteExpense, setBudget],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}

/* ---------- helpers ---------- */

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const sum = (list: Expense[]) => list.reduce((a, e) => a + e.amount, 0);

export function inRange(list: Expense[], start: Date, end: Date) {
  return list.filter((e) => isWithinInterval(parseISO(e.date), { start, end }));
}

export function thisMonth(list: Expense[], now = new Date()) {
  return inRange(list, startOfMonth(now), endOfMonth(now));
}

export function thisWeek(list: Expense[], now = new Date()) {
  return inRange(list, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }));
}

export function lastWeek(list: Expense[], now = new Date()) {
  const lw = subWeeks(now, 1);
  return inRange(list, startOfWeek(lw, { weekStartsOn: 1 }), endOfWeek(lw, { weekStartsOn: 1 }));
}

export function byCategory(list: Expense[]) {
  const map = new Map<Category, number>();
  for (const c of CATEGORIES) map.set(c, 0);
  for (const e of list) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  return CATEGORIES.map((c) => ({ category: c, total: map.get(c) ?? 0 })).filter((x) => x.total > 0);
}

export function last7Days(list: Expense[], now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(now, 6 - i);
    const key = format(d, "yyyy-MM-dd");
    return {
      label: format(d, "EEE"),
      total: sum(list.filter((e) => e.date === key)),
    };
  });
}

export function last6Months(list: Expense[], now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: format(d, "MMM"),
      total: sum(inRange(list, startOfMonth(d), endOfMonth(d))),
    };
  });
}

/* ---------- insights ---------- */

export type InsightTone = "positive" | "warning" | "danger" | "info";
export interface Insight {
  tone: InsightTone;
  text: string;
}

export function generateInsights(list: Expense[], budget: number, now = new Date()): Insight[] {
  const out: Insight[] = [];
  if (list.length === 0) {
    return [
      {
        tone: "info",
        text: "Add a few expenses and SmartSpend AI will start spotting patterns in your spending.",
      },
    ];
  }

  const month = thisMonth(list, now);
  const spent = sum(month);
  const pct = budget > 0 ? spent / budget : 0;

  if (budget > 0) {
    if (pct >= 1) {
      out.push({
        tone: "danger",
        text: `You've exceeded your monthly budget by ${formatMoney(spent - budget)}. Try to pause non-essential spending for the rest of the month.`,
      });
    } else if (pct >= 0.8) {
      out.push({
        tone: "warning",
        text: `You are close to your monthly budget — ${Math.round(pct * 100)}% used with ${formatMoney(budget - spent)} left.`,
      });
    } else if (pct <= 0.4 && now.getDate() > 15) {
      out.push({
        tone: "positive",
        text: `Great pacing! You're past mid-month and have used only ${Math.round(pct * 100)}% of your budget.`,
      });
    }
  }

  const week = thisWeek(list, now);
  const prev = lastWeek(list, now);
  const weekCats = byCategory(week);
  const prevMap = new Map(byCategory(prev).map((c) => [c.category, c.total]));
  for (const c of weekCats) {
    const before = prevMap.get(c.category) ?? 0;
    if (before > 0 && c.total > before * 1.3) {
      out.push({
        tone: "warning",
        text: `You spent more on ${c.category.toLowerCase()} this week — ${formatMoney(c.total)} vs ${formatMoney(before)} last week.`,
      });
      break;
    }
  }

  const cats = byCategory(month).sort((a, b) => b.total - a.total);
  const top = cats[0];
  if (top && spent > 0) {
    const share = Math.round((top.total / spent) * 100);
    if (share >= 40) {
      out.push({
        tone: "info",
        text: `${top.category} is your biggest expense this month at ${share}% of total spending.`,
      });
    }
    const shopping = cats.find((c) => c.category === "Shopping");
    if (shopping && shopping.total / spent >= 0.2) {
      out.push({
        tone: "info",
        text: `You could reduce shopping expenses (${formatMoney(shopping.total)} this month) to save more.`,
      });
    }
  }

  const daysElapsed = Math.max(1, now.getDate());
  const daily = spent / daysElapsed;
  const daysInMonth = endOfMonth(now).getDate();
  const projected = daily * daysInMonth;
  if (budget > 0 && spent > 0 && projected > budget * 1.05 && pct < 1) {
    out.push({
      tone: "warning",
      text: `At your current pace (${formatMoney(daily)}/day) you'd end the month around ${formatMoney(projected)}, above your budget.`,
    });
  } else if (budget > 0 && spent > 0 && projected <= budget) {
    out.push({
      tone: "positive",
      text: `You're spending about ${formatMoney(daily)} per day — on track to finish the month within budget.`,
    });
  }

  if (out.length === 0) {
    out.push({ tone: "positive", text: "Your spending looks balanced this month. Keep it up!" });
  }
  return out.slice(0, 4);
}
