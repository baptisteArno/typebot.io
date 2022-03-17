import Icon, { IconProps } from '@chakra-ui/icon'
import React from 'react'

export const DoIcon = (props: IconProps) => (
  <Icon
    viewBox="0 0 150 150"
    boxSize="50px"
    xmlns="http://www.w3.org/2000/svg"
    fill="#4ADE80"
    fillOpacity="0.8"
    {...props}
  >
    <rect width="150" height="150" rx="75" />
    <path
      d="M100 58L65.625 92.375L50 76.75"
      stroke="white"
      strokeWidth="10"
      fill="#40b76f"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
)
