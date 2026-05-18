import { Button } from "@/components/ui/button";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max, ariaLabel = "Quantity" }: Props) {
  const canDecrease = value > min;
  const canIncrease = max === undefined || value < max;

  return (
    // biome-ignore lint/a11y/useSemanticElements: allow
    <div role="group" aria-label={ariaLabel} className="flex items-center border border-border">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
        className="rounded-none"
      >
        −
      </Button>
      <span aria-live="polite" className="w-10 text-center font-medium text-sm tabular-nums">
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label="Increase quantity"
        className="rounded-none"
      >
        +
      </Button>
    </div>
  );
}
