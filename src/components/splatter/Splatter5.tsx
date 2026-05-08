type Props = {
  className?: string;
  color?: string;
  opacity?: number;
};

export function Splatter5({ className = "", color = "#6B4423", opacity = 1 }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Small accent splat — for use next to headings/buttons */}
      <path
        d="M50,50 C50,50 58,38 65,32 C70,27 76,31 73,38 C71,43 65,45 62,50 C67,45 74,40 79,44 C84,48 82,56 76,58 C71,60 65,57 61,61 C66,63 72,64 72,70 C66,75 58,70 58,64 C60,57 66,56 64,50 C60,56 56,64 50,62 C44,60 44,52 50,50Z"
        fill={color}
      />
      <path
        d="M38,42 C38,42 44,34 50,30 C54,27 58,31 55,38 C53,43 47,44 44,49"
        fill={color}
      />
      <circle cx="66" cy="28" r="3" fill={color} />
      <circle cx="72" cy="22" r="2" fill={color} />
      <circle cx="36" cy="52" r="2.5" fill={color} />
      <circle cx="74" cy="72" r="2" fill={color} />
      <ellipse cx="42" cy="38" rx="3" ry="2" transform="rotate(-25 42 38)" fill={color} />
    </svg>
  );
}
