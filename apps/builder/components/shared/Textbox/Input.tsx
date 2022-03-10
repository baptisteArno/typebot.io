import { Input as ChakraInput } from '@chakra-ui/react'
import React from 'react'
import { TextBox, TextBoxProps } from './TextBox'

export const Input = (props: Omit<TextBoxProps, 'TextBox'>) => (
  <TextBox TextBox={ChakraInput} {...props} />
)
