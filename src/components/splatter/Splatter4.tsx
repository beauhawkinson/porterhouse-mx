type Props = {
  className?: string;
  color?: string;
  opacity?: number;
};

export function Splatter4({ className = "", color = "#3E2A1E", opacity = 1 }: Props) {
  return (
    <svg
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Wide horizontal streak */}
      <path
        d="M10,60 C10,60 30,40 55,35 C68,32 78,40 72,52 C67,61 54,63 46,70 C58,64 74,56 86,62 C98,68 96,84 84,87 C74,90 62,84 52,90 C64,94 80,96 82,108 C71,116 58,106 56,95 C60,82 72,80 74,68 C62,76 52,90 40,88 C28,86 26,70 38,66 C48,63 60,68 64,60"
        fill={color}
      />
      <path
        d="M120,55 C120,55 145,38 168,32 C180,28 190,36 184,48 C179,57 166,60 158,68 C170,60 186,52 198,58 C210,64 208,80 196,82 C186,84 174,78 164,84 C176,88 192,90 192,103 C181,111 166,102 165,91 C168,78 180,76 180,64 C168,72 160,86 146,83 C132,80 132,64 144,60"
        fill={color}
      />
      <path
        d="M220,50 C220,50 242,36 262,30 C274,26 282,34 276,46 C271,55 258,58 252,66 C264,58 278,50 288,56 C298,62 296,76 286,80 C278,83 266,77 258,83"
        fill={color}
      />
      <circle cx="24" cy="48" r="4" fill={color} />
      <circle cx="16" cy="38" r="2.5" fill={color} />
      <circle cx="44" cy="95" r="3" fill={color} />
      <circle cx="194" cy="95" r="4" fill={color} />
      <circle cx="292" cy="44" r="3" fill={color} />
      <circle cx="299" cy="36" r="2" fill={color} />
      <ellipse cx="100" cy="58" rx="5" ry="3" transform="rotate(-10 100 58)" fill={color} />
    </svg>
  );
}
