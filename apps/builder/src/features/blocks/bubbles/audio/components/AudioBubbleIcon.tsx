import { featherIconsBaseProps } from '@/components/icons'
import { Icon, IconProps } from '@chakra-ui/react'
import React from 'react'

export const AudioBubbleIcon = (props: IconProps) => (
  <Icon color="blue.500" {...featherIconsBaseProps} {...props}>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
  </Icon>
)
