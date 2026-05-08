import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Splatter5 } from "@/components/splatter";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  withSplat?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#111] text-white hover:bg-[#3E2A1E] active:scale-[0.98] shadow-sm",
  secondary:
    "bg-white text-[#111] border border-[#ddd] hover:border-[#8B5A2B] hover:text-[#6B4423] active:scale-[0.98]",
  ghost: "bg-transparent text-[#111] hover:text-[#6B4423] active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", withSplat = false, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          "relative inline-flex items-center justify-center gap-2 font-heading tracking-wider transition-all duration-150 cursor-pointer select-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
        {withSplat && (
          <Splatter5
            className="absolute -top-2 -right-2 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            color="#8B5A2B"
          />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
