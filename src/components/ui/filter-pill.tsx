import Link from "@/components/ui/link";

import type { Category } from "@/lib/db/schema";

export function FilterPill({
  to,
  search,
  active,
  label,
}: {
  to: string;
  search: { category?: Category };
  active: boolean;
  label: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      variant="unstyled"
      size="none"
      className={`inline-flex h-10 cursor-pointer items-center justify-center border px-4 font-heading text-sm tracking-wider outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:border-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
