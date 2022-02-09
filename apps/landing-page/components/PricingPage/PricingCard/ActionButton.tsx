import { Button, ButtonProps } from '@chakra-ui/react'
import * as React from 'react'

export const ActionButton = (props: ButtonProps) => (
  <Button
    colorScheme="blue"
    size="lg"
    w="full"
    fontWeight="extrabold"
    py={{ md: '8' }}
    {...props}
  />
)
