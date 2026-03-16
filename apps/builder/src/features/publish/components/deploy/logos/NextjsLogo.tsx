import { useId } from "react";

export const NextjsLogo = (props: React.SVGProps<SVGSVGElement>) => {
  const baseId = useId();
  const maskId = `${baseId}-mask`;
  const firstGradientId = `${baseId}-paint0`;
  const secondGradientId = `${baseId}-paint1`;

  return (
    <svg
      aria-label="Next.js logomark"
      height="80"
      role="img"
      viewBox="0 0 180 180"
      width="80"
      {...props}
    >
      <mask
        height="180"
        id={maskId}
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
        width="180"
        x="0"
        y="0"
      >
        <circle cx="90" cy="90" fill="black" r="90" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <circle cx="90" cy="90" data-circle="true" fill="black" r="90" />
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill={`url(#${firstGradientId})`}
        />
        <rect
          fill={`url(#${secondGradientId})`}
          height="72"
          width="12"
          x="115"
          y="54"
        />
      </g>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={firstGradientId}
          x1="109"
          x2="144.5"
          y1="116.5"
          y2="160.5"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={secondGradientId}
          x1="121"
          x2="120.799"
          y1="54"
          y2="106.875"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
