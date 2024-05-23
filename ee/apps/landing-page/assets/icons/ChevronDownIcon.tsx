import Icon, { IconProps } from '@chakra-ui/icon'
import React from 'react'

export const ChevronDownIcon = (props: IconProps) => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="18px"
    {...props}
  >
    <title>Chevron Down</title>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="48"
      d="M112 184l144 144 144-144"
    />
  </Icon>
)
