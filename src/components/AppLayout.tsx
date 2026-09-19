import { Link } from "@tanstack/react-router";
import { BarChart3, LayoutDashboard, PlusCircle, ReceiptText, Sparkles, Wallet } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add", label: "Add Expense", icon: PlusCircle },
  { to: "/expenses", label: "Expenses", icon: ReceiptText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/budget", label: "Budget", icon: Wallet },
] as const;

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="mint-gradient grid size-9 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
        <Sparkles className="size-5" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight">
          SmartSpend <span className="text-gold">AI</span>
        </span>
      )}
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-foreground ring-1 ring-primary/30",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-xs text-muted-foreground">
          Smart budgeting for students.
        </p>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <Link
          to="/add"
          className="mint-gradient rounded-lg px-3 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          + Add
        </Link>
      </header>

      <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {/* Bottom tabs (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-sidebar/95 backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-sidebar-foreground/60"
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="size-5" />
            {label === "Add Expense" ? "Add" : label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
