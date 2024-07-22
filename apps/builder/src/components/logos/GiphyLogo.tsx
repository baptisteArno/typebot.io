import { IconProps, Icon, useColorModeValue } from '@chakra-ui/react'

export const GiphyLogo = (props: IconProps) => (
  <Icon viewBox="0 0 163.79999999999998 35" {...props}>
    <g fill="none" fillRule="evenodd">
      <path d="M4 4h20v27H4z" fill="#000" />
      <g fillRule="nonzero">
        <path d="M0 3h4v29H0z" fill="#04ff8e" />
        <path d="M24 11h4v21h-4z" fill="#8e2eff" />
        <path d="M0 31h28v4H0z" fill="#00c5ff" />
        <path d="M0 0h16v4H0z" fill="#fff152" />
        <path d="M24 8V4h-4V0h-4v12h12V8" fill="#ff5b5b" />
        <path d="M24 16v-4h4" fill="#551c99" />
      </g>
      <path d="M16 0v4h-4" fill="#999131" />
      <path
        d="M59.1 12c-2-1.9-4.4-2.4-6.2-2.4-4.4 0-7.3 2.6-7.3 8 0 3.5 1.8 7.8 7.3 7.8 1.4 0 3.7-.3 5.2-1.4v-3.5h-6.9v-6h13.3v12.1c-1.7 3.5-6.4 5.3-11.7 5.3-10.7 0-14.8-7.2-14.8-14.3S42.7 3.2 52.9 3.2c3.8 0 7.1.8 10.7 4.4zm9.1 19.2V4h7.6v27.2zm20.1-7.4v7.3h-7.7V4h13.2c7.3 0 10.9 4.6 10.9 9.9 0 5.6-3.6 9.9-10.9 9.9zm0-6.5h5.5c2.1 0 3.2-1.6 3.2-3.3 0-1.8-1.1-3.4-3.2-3.4h-5.5zM125 31.2V20.9h-9.8v10.3h-7.7V4h7.7v10.3h9.8V4h7.6v27.2zm24.2-17.9l5.9-9.3h8.7v.3l-10.8 16v10.8h-7.7V20.3L135 4.3V4h8.7z"
        fill={useColorModeValue('#000', '#fff')}
        fillRule="nonzero"
      />
    </g>
  </Icon>
)
