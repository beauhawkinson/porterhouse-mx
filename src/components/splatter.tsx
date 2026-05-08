type Props = {
  className?: string;
  color?: string;
  opacity?: number;
};

export function Splatter({ className = "", color = "#3E2A1E", opacity = 1 }: Props) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <path
        d="M80,90 C80,90 55,70 40,50 C30,36 38,20 50,28 C58,33 62,48 70,55 C65,40 60,22 68,15 C76,8 88,18 84,32 C81,42 88,58 95,65 C100,52 98,32 108,25 C118,18 128,30 122,42 C117,52 108,62 112,75 C122,65 135,52 148,55 C161,58 162,74 152,80 C144,85 132,83 122,88 C132,95 148,98 150,112 C152,126 138,132 128,124 C120,118 118,104 108,100 C110,115 115,132 106,140 C97,148 84,140 86,128 C88,118 96,108 90,98 C82,108 78,124 65,124 C52,124 48,110 58,102 C66,96 78,96 80,90Z"
        fill={color}
      />
      <circle cx="35" cy="68" r="5" fill={color} />
      <circle cx="28" cy="80" r="3" fill={color} />
      <circle cx="160" cy="62" r="4" fill={color} />
      <circle cx="168" cy="50" r="2.5" fill={color} />
      <circle cx="95" cy="148" r="4" fill={color} />
      <circle cx="105" cy="158" r="2" fill={color} />
      <ellipse cx="48" cy="45" rx="4" ry="2.5" transform="rotate(-30 48 45)" fill={color} />
      <ellipse cx="155" cy="90" rx="3" ry="5" transform="rotate(20 155 90)" fill={color} />
    </svg>
  );
}
