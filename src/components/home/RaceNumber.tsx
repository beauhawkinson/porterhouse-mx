/**
 * The client's race number, 127, as a hollow outlined numeral with a gradient
 * stroke (white → primary). Decorative accent; drop it anywhere and size it with
 * the wrapper's width. SVG because a *gradient* text outline isn't possible with
 * CSS `-webkit-text-stroke`.
 */
export function RaceNumber({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 128" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="race-number-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--foreground)" }} />
          <stop offset="1" style={{ stopColor: "var(--primary)" }} />
        </linearGradient>
      </defs>
      <text
        x="130"
        y="70"
        textAnchor="middle"
        dominantBaseline="central"
        fill="none"
        stroke="url(#race-number-stroke)"
        strokeWidth="2.25"
        style={{
          fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
          fontWeight: 900,
          fontSize: "108px",
          letterSpacing: "-5px",
        }}
      >
        127
      </text>
    </svg>
  );
}
