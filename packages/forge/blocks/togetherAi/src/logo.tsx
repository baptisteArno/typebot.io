/** @jsxImportSource react */

import { useId } from "react";

export const TogetherAiLogo = (props: React.SVGProps<SVGSVGElement>) => {
  const clipPathId = useId();

  return (
    <svg viewBox="0 0 32 32" {...props}>
      <title>TogetherAi Logo</title>
      <g clipPath={`url(#${clipPathId})`}>
        <rect width="32" height="32" rx="5.64706" fill="#F1EFED" />
        <circle cx="22.8233" cy="9.64706" r="5.64706" fill="#D3D1D1" />
        <circle cx="22.8233" cy="22.8238" r="5.64706" fill="#D3D1D1" />
        <circle cx="9.64706" cy="22.8238" r="5.64706" fill="#D3D1D1" />
        <circle cx="9.64706" cy="9.64706" r="5.64706" fill="#0F6FFF" />
      </g>
      <defs>
        <clipPath id={clipPathId}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
