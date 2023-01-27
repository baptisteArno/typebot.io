import { featherIconsBaseProps } from '@/components/icons'
import { Icon, IconProps, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

export const ScriptIcon = (props: IconProps) => (
  <Icon
    viewBox="0 0 24 24"
    color={useColorModeValue('purple.500', 'purple.300')}
    {...featherIconsBaseProps}
    {...props}
  >
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </Icon>
)
