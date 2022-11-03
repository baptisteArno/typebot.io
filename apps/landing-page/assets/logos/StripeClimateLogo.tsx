import { Icon, IconProps } from '@chakra-ui/react'

export const StripeClimateLogo = (props: IconProps) => (
  <Icon
    width="24px"
    height="24px"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <linearGradient
      id="StripeClimate-gradient-a"
      gradientUnits="userSpaceOnUse"
      x1="16"
      y1="20.6293"
      x2="16"
      y2="7.8394"
      gradientTransform="matrix(1 0 0 -1 0 34)"
    >
      <stop offset="0" stopColor="#00d924" />
      <stop offset="1" stopColor="#00cb1b" />
    </linearGradient>
    <path
      d="M0 10.82h32c0 8.84-7.16 16-16 16s-16-7.16-16-16z"
      fill="url(#StripeClimate-gradient-a)"
    />
    <linearGradient
      id="StripeClimate-gradient-b"
      gradientUnits="userSpaceOnUse"
      x1="24"
      y1="28.6289"
      x2="24"
      y2="17.2443"
      gradientTransform="matrix(1 0 0 -1 0 34)"
    >
      <stop offset=".1562" stopColor="#009c00" />
      <stop offset="1" stopColor="#00be20" />
    </linearGradient>
    <path
      d="M32 10.82c0 2.21-1.49 4.65-5.41 4.65-3.42 0-7.27-2.37-10.59-4.65 3.52-2.43 7.39-5.63 10.59-5.63C29.86 5.18 32 8.17 32 10.82z"
      fill="url(#StripeClimate-gradient-b)"
    />
    <linearGradient
      id="StripeClimate-gradient-c"
      gradientUnits="userSpaceOnUse"
      x1="8"
      y1="16.7494"
      x2="8"
      y2="29.1239"
      gradientTransform="matrix(1 0 0 -1 0 34)"
    >
      <stop offset="0" stopColor="#ffe37d" />
      <stop offset="1" stopColor="#ffc900" />
    </linearGradient>
    <path
      d="M0 10.82c0 2.21 1.49 4.65 5.41 4.65 3.42 0 7.27-2.37 10.59-4.65-3.52-2.43-7.39-5.64-10.59-5.64C2.14 5.18 0 8.17 0 10.82z"
      fill="url(#StripeClimate-gradient-c)"
    />
  </Icon>
)
