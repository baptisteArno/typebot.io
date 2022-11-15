import { Textarea as ChakraTextarea } from '@chakra-ui/react'
import React from 'react'
import { TextBox, TextBoxProps } from './TextBox'

export const Textarea = (props: Omit<TextBoxProps, 'TextBox'>) => (
  <TextBox TextBox={ChakraTextarea} {...props} />
)
