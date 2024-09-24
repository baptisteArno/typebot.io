import type { JSX } from "solid-js/jsx-runtime";

export const ChevronDownIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2px"
    stroke-linecap="round"
    stroke-linejoin="round"
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
