import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppLayout";
import { ExpenseForm } from "@/components/ExpenseForm";
import { formatMoney, useExpenses } from "@/lib/expenses-store";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add Expense — SmartSpend AI" },
      { name: "description", content: "Log a new expense with amount, category, date and description." },
      { property: "og:title", content: "Add Expense — SmartSpend AI" },
      { property: "og:description", content: "Quickly record what you spent today." },
    ],
  }),
  component: AddExpense,
});

function AddExpense() {
  const { addExpense } = useExpenses();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Add expense" subtitle="Log it now so you don't forget later." />
      <div className="surface-card mx-auto max-w-xl p-6 md:p-8">
        <ExpenseForm
          onSubmit={(v) => {
            addExpense(v);
            toast.success(`Saved ${formatMoney(v.amount)} for ${v.category}`);
            navigate({ to: "/" });
          }}
        />
      </div>
    </>
  );
}
