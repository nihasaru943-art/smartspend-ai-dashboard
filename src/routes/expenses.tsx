import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppLayout";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, formatMoney, sum, useExpenses, type Category, type Expense } from "@/lib/expenses-store";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — SmartSpend AI" },
      { name: "description", content: "Review, edit and delete all your recorded expenses." },
      { property: "og:title", content: "Expenses — SmartSpend AI" },
      { property: "og:description", content: "All your spending in one clean list." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { expenses, updateExpense, deleteExpense } = useExpenses();
  const [filter, setFilter] = useState<Category | "All">("All");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const list = useMemo(
    () =>
      [...expenses]
        .filter((e) => filter === "All" || e.category === filter)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [expenses, filter],
  );

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={`${list.length} ${list.length === 1 ? "entry" : "entries"} · Total ${formatMoney(sum(list))}`}
        action={
          <Select value={filter} onValueChange={(v) => setFilter(v as Category | "All")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="surface-card overflow-hidden">
        {list.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Nothing here yet.{" "}
            <Link to="/add" className="text-primary hover:underline">
              Add an expense
            </Link>
            .
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-secondary/40">
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{format(parseISO(e.date), "d MMM yyyy")}</td>
                    <td className="px-5 py-3 font-medium">{e.description || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-5 py-3"><CategoryBadge category={e.category} /></td>
                    <td className="px-5 py-3 text-right font-semibold tabular">{formatMoney(e.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <RowActions onEdit={() => setEditing(e)} onDelete={() => setDeleting(e)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-border md:hidden">
              {list.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.description || e.category}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {format(parseISO(e.date), "d MMM")} <CategoryBadge category={e.category} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mr-1 font-semibold tabular">{formatMoney(e.amount)}</span>
                    <RowActions onEdit={() => setEditing(e)} onDelete={() => setDeleting(e)} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit expense</DialogTitle>
          </DialogHeader>
          {editing && (
            <ExpenseForm
              key={editing.id}
              initial={editing}
              submitLabel="Update expense"
              onSubmit={(v) => {
                updateExpense(editing.id, v);
                setEditing(null);
                toast.success("Expense updated");
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && `${formatMoney(deleting.amount)} · ${deleting.description || deleting.category}`} will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) deleteExpense(deleting.id);
                setDeleting(null);
                toast.success("Expense deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="inline-flex gap-1">
      <Button variant="ghost" size="icon" aria-label="Edit" onClick={onEdit} className="size-8">
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Delete" onClick={onDelete} className="size-8 text-destructive hover:text-destructive">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
