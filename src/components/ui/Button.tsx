import { cva } from "class-variance-authority";
import clsx from "clsx";

import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-heading tracking-wider",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 shrink-0",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none outline-none transition-all duration-150",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        unstyled: "",
        primary:
          "bg-foreground text-background border-0 shadow-sm hover:bg-mud-darkest focus-visible:ring focus-visible:ring-mud focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        secondary:
          "bg-surface text-foreground border border-border hover:border-mud hover:text-mud-dark focus-visible:border-mud",
        ghost:
          "bg-transparent text-foreground border-transparent hover:text-mud-dark hover:bg-muted",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        "icon-sm": "size-8",
        "icon-md": "size-10",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={clsx(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
