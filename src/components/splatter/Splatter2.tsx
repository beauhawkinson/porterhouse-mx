type Props = {
  className?: string;
  color?: string;
  opacity?: number;
};

export function Splatter2({ className = "", color = "#6B4423", opacity = 1 }: Props) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <path
        d="M120,100 C120,100 140,78 158,65 C170,56 182,64 176,76 C171,85 158,88 150,96 C164,90 180,82 192,88 C204,94 202,110 190,114 C180,117 168,112 158,118 C170,122 184,124 186,136 C188,148 174,154 164,146 C156,140 154,126 144,124 C148,138 152,155 142,162 C132,169 120,160 124,148 C127,138 136,130 130,120 C122,132 118,150 104,148 C90,146 88,130 100,124 C109,119 122,122 124,112 C112,120 98,128 86,122 C74,116 74,100 86,96 C96,93 108,100 116,94 C104,86 88,80 88,66 C88,52 102,46 112,56 C119,63 118,78 124,84 C124,70 120,52 130,44 C140,36 152,46 148,58 C145,68 136,76 138,86 C146,76 152,62 166,62 C180,62 184,78 174,84 C166,89 154,88 148,96Z"
        fill={color}
      />
      <circle cx="200" cy="80" r="6" fill={color} />
      <circle cx="212" cy="72" r="3.5" fill={color} />
      <circle cx="78" cy="78" r="5" fill={color} />
      <circle cx="68" cy="68" r="3" fill={color} />
      <circle cx="120" cy="172" r="5" fill={color} />
      <circle cx="130" cy="182" r="2.5" fill={color} />
      <ellipse cx="185" cy="108" rx="5" ry="3" transform="rotate(15 185 108)" fill={color} />
      <ellipse cx="70" cy="100" rx="3" ry="5" transform="rotate(-20 70 100)" fill={color} />
    </svg>
  );
}
