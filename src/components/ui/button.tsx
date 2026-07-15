import { cva } from "class-variance-authority";
import clsx from "clsx";

import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      // Focus states: solid CTAs (primary/destructive) get an offset ring;
      // every other variant gets a primary-colored border. Borderless variants
      // carry a transparent `border` at rest so focus only recolors it —
      // nothing changes size, so tabbing between buttons causes no layout shift.
      variant: {
        primary:
          "rounded-lg font-heading whitespace-nowrap select-none active:scale-[0.97] bg-foreground text-background shadow-sm hover:bg-foreground/80 focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        outline:
          "rounded-lg font-heading whitespace-nowrap select-none active:scale-[0.97] border border-border bg-transparent text-secondary-foreground hover:bg-muted hover:text-foreground focus-visible:border-primary",
        secondary:
          "rounded-lg font-heading whitespace-nowrap select-none active:scale-[0.97] bg-muted text-foreground border border-border hover:border-foreground focus-visible:border-primary",
        ghost:
          "rounded-lg font-heading whitespace-nowrap select-none active:scale-[0.97] bg-transparent text-foreground hover:bg-muted hover:text-primary border border-transparent focus-visible:border-primary",
        // Inline within prose: "Sign in", "Continue shopping"
        inline:
          "rounded-sm text-primary underline underline-offset-4 hover:text-primary/80 border border-transparent focus-visible:border-primary",
        // Subtle muted toggles: "Show sizes" / "Hide sizes"
        muted:
          "rounded-sm text-faded-foreground text-xs underline underline-offset-4 hover:text-foreground border border-transparent focus-visible:border-primary",
        // Nav (header + admin sub-nav)
        nav: "rounded-sm font-heading text-secondary-foreground text-sm hover:text-primary [&.active]:text-primary [&.active]:underline [&.active]:underline-offset-4 border border-transparent focus-visible:border-primary",
        // Mobile menu rows — full-width, bigger touch target
        "nav-mobile":
          "rounded-sm block w-full py-3 font-heading text-foreground text-base hover:text-primary [&.active]:text-primary [&.active]:underline [&.active]:underline-offset-4 border border-transparent focus-visible:border-primary",
        // Logo / brand wordmark
        logo: "rounded-sm font-moto_is_life text-foreground text-xl tracking-widest hover:text-primary border border-transparent focus-visible:border-primary",
        destructive:
          "border-0 bg-red-500 rounded-lg text-white hover:bg-red-500/80 focus-visible:ring focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        unstyled: "",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-sm",
        "icon-sm": "size-8",
        "icon-md": "size-10",
        "icon-lg": "size-12",
        // For text-shaped variants — they bring their own typography
        none: "",
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
  return (
    <button
      type="button"
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
