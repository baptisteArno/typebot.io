import { FormLabel, HStack, Switch, SwitchProps } from '@chakra-ui/react'
import React, { useState } from 'react'

type SwitchWithLabelProps = {
  id: string
  label: string
  initialValue: boolean
  onCheckChange: (isChecked: boolean) => void
} & SwitchProps

export const SwitchWithLabel = ({
  id,
  label,
  initialValue,
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
      <FormLabel htmlFor={id} mb="0">
        {label}
      </FormLabel>
      <Switch
        isChecked={isChecked}
        onChange={handleChange}
        id={id}
        {...props}
      />
    </HStack>
  )
}
