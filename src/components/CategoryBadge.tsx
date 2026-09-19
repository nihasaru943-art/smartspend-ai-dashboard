import { CATEGORY_COLORS, type Category } from "@/lib/expenses-store";

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium">
      <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS[category] }} />
      {category}
    </span>
  );
}
