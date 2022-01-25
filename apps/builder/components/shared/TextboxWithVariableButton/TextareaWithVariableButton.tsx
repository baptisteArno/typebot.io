import { Textarea } from '@chakra-ui/react'
import React from 'react'
import {
  TextBoxWithVariableButton,
  TextBoxWithVariableButtonProps,
} from './TextboxWithVariableButton'

export const TextareaWithVariableButton = (
  props: Omit<TextBoxWithVariableButtonProps, 'TextBox'>
) => <TextBoxWithVariableButton TextBox={Textarea} {...props} />
