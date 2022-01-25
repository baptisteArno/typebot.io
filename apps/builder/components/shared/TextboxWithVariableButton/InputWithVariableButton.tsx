import { Input } from '@chakra-ui/react'
import React from 'react'
import {
  TextBoxWithVariableButton,
  TextBoxWithVariableButtonProps,
} from './TextboxWithVariableButton'

export const InputWithVariableButton = (
  props: Omit<TextBoxWithVariableButtonProps, 'TextBox'>
) => <TextBoxWithVariableButton TextBox={Input} {...props} />
