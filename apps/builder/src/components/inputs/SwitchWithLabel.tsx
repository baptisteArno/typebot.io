import {
  FormControl,
  FormLabel,
  HStack,
  Switch,
  SwitchProps,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

type SwitchWithLabelProps = {
  label: string
  initialValue: boolean
  moreInfoContent?: string
  onCheckChange: (isChecked: boolean) => void
} & SwitchProps

export const SwitchWithLabel = ({
  label,
  initialValue,
  moreInfoContent,
  onCheckChange,
  ...switchProps
}: SwitchWithLabelProps) => {
  const [isChecked, setIsChecked] = useState(initialValue)

  const handleChange = () => {
    setIsChecked(!isChecked)
    onCheckChange(!isChecked)
  }
  return (
    <FormControl as={HStack} justifyContent="space-between">
      <FormLabel mb="0">
        {label}
        {moreInfoContent && (
          <>
            &nbsp;<MoreInfoTooltip>{moreInfoContent}</MoreInfoTooltip>
          </>
        )}
      </FormLabel>
      <Switch isChecked={isChecked} onChange={handleChange} {...switchProps} />
    </FormControl>
  )
}
