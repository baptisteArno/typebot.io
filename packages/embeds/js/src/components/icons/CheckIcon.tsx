import { JSX } from 'solid-js/jsx-runtime'

export const CheckIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3px"
    stroke-linecap="round"
    stroke-linejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
