import Icon, { IconProps } from '@chakra-ui/icon'
import React from 'react'
import { featherIconsBaseProps } from '.'

export const CheckIcon = (props: IconProps) => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentcolor"
    {...featherIconsBaseProps}
    {...props}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </Icon>
)
