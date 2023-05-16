import React from 'react'
import { SwitchWithLabel, SwitchWithLabelProps } from './inputs/SwitchWithLabel'
import { Stack } from '@chakra-ui/react'

type Props = SwitchWithLabelProps

export const SwitchWithRelatedSettings = ({ children, ...props }: Props) => (
  <Stack
    borderWidth={props.initialValue ? 1 : undefined}
    rounded="md"
    p={props.initialValue ? '3' : undefined}
    spacing={4}
  >
    <SwitchWithLabel {...props} />
    {props.initialValue && children}
  </Stack>
)
