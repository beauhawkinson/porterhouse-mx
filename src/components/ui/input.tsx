import clsx from "clsx";

import type * as React from "react";

function Input({ className, type, onWheel, ...props }: React.ComponentProps<"input">) {
  // Number inputs change their value when you scroll the wheel over them while
  // focused — a footgun that silently nudges prices/stock (e.g. $5.00 → $4.97).
  // Blur on wheel so scrolling never edits the field.
  const handleWheel: React.WheelEventHandler<HTMLInputElement> = (e) => {
    if (type === "number") e.currentTarget.blur();
    onWheel?.(e);
  };

  return (
    <input
      type={type}
      onWheel={handleWheel}
      data-slot="input"
      className={clsx(
        "w-full min-w-0 cursor-auto rounded-lg border border-border bg-transparent px-3 py-2.5 font-normal text-base text-secondary-foreground outline-none",
        "transition-colors selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0",
        "placeholder: text-xs placeholder:text-faded-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:bg-transparent file:font-medium file:text-secondary-foreground focus-visible:border-primary focus-visible:outline-none",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
