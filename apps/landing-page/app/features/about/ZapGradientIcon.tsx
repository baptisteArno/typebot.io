import type { SVGProps } from "react";

export const ZapGradientIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" strokeWidth={0}>
    <path
      d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
      fill="url(#gradient)"
    />
    <defs>
      <radialGradient
        id="gradient"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(15.3052 2.92208) rotate(107.42) scale(21.0743 19.0986)"
      >
        <stop stopColor="#FF4D19" />
        <stop offset="1" stopColor="#9D84FE" />
      </radialGradient>
    </defs>
  </svg>
);
