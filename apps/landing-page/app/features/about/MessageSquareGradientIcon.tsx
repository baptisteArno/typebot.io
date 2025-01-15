import type { SVGProps } from "react";

export const MessageSquareGradientIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24">
    <path
      d="M5 2C3.355 2 2 3.355 2 5v16c0 .89 1.077 1.337 1.707.707L7.414 18H19c1.645 0 3-1.355 3-3V5c0-1.645-1.355-3-3-3Z"
      fill="url(#gradient)"
    />
    <defs>
      <radialGradient
        id="gradient"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(18.9499 2.42947) rotate(113.659) scale(19.8108 23.1029)"
      >
        <stop stopColor="#FF4D19" />
        <stop offset="1" stopColor="#9D84FE" />
      </radialGradient>
    </defs>
  </svg>
);
