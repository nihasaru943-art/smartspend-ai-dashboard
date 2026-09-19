import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Category, type Expense } from "@/lib/expenses-store";

type Values = Omit<Expense, "id" | "createdAt">;

export function ExpenseForm({
  initial,
  onSubmit,
  submitLabel = "Save expense",
}: {
  initial?: Partial<Values>;
  onSubmit: (v: Values) => void;
  submitLabel?: string;
}) {
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Food");
  const [date, setDate] = useState(initial?.date ?? format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n <= 0) return setError("Enter an amount greater than 0.");
    if (!date) return setError("Pick a date.");
    setError(null);
    onSubmit({ amount: Math.round(n * 100) / 100, category, date, description: description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-12 text-lg tabular"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Lunch at canteen"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-11"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full font-semibold">
        {submitLabel}
      </Button>
    </form>
  );
}
