import { FormLabel, HStack, Switch, SwitchProps } from '@chakra-ui/react'
import React, { useState } from 'react'

type SwitchWithLabelProps = {
  label: string
  initialValue: boolean
  onCheckChange: (isChecked: boolean) => void
} & SwitchProps

export const SwitchWithLabel = ({
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
      <FormLabel htmlFor={props.id} mb="0">
        {label}
      </FormLabel>
      <Switch isChecked={isChecked} onChange={handleChange} {...props} />
    </HStack>
  )
}
