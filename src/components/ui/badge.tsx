import { cva } from "class-variance-authority";
import clsx from "clsx";

import type { VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 font-heading text-xs tracking-wider uppercase border",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-foreground",
        success: "border-green-200 bg-green-50 text-green-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
        danger: "border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

type Props = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ tone, className, ...rest }: Props) {
  return <span className={clsx(badgeVariants({ tone }), className)} {...rest} />;
}
