import type { SVGProps } from "react";

export const HeartGradientIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" strokeWidth={0}>
    <path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      fill="url(#gradient)"
    />
    <defs>
      <linearGradient
        id="gradient"
        x1="12"
        y1="-0.132879"
        x2="-4.12826"
        y2="8.44515"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF491F" />
        <stop offset="1" stopColor="#C13EAA" />
      </linearGradient>
    </defs>
  </svg>
);
