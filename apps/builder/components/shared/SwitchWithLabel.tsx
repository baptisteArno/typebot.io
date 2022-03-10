import {
  chakra,
  FormLabel,
  HStack,
  Switch,
  SwitchProps,
  Tooltip,
} from '@chakra-ui/react'
import { HelpCircleIcon } from 'assets/icons'
import React, { useState } from 'react'

type SwitchWithLabelProps = {
  id: string
  label: string
  initialValue: boolean
  moreInfoContent?: string
  onCheckChange: (isChecked: boolean) => void
} & SwitchProps

export const SwitchWithLabel = ({
  id,
  label,
  initialValue,
  moreInfoContent,
  onCheckChange,
  ...props
}: SwitchWithLabelProps) => {
  const [isChecked, setIsChecked] = useState(initialValue)

  const handleChange = () => {
    setIsChecked(!isChecked)
    onCheckChange(!isChecked)
  }
  return (
    <HStack justifyContent="space-between">
      <HStack>
        <FormLabel htmlFor={id} mb="0" mr="0">
          {label}
        </FormLabel>
        {moreInfoContent && (
          <Tooltip label={moreInfoContent}>
            <chakra.span cursor="pointer">
              <HelpCircleIcon />
            </chakra.span>
          </Tooltip>
        )}
      </HStack>
      <Switch
        isChecked={isChecked}
        onChange={handleChange}
        id={id}
        {...props}
      />
    </HStack>
  )
}
