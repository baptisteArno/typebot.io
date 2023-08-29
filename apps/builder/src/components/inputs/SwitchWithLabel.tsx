import {
  FormControl,
  FormControlProps,
  FormLabel,
  HStack,
  Switch,
  SwitchProps,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

export type SwitchWithLabelProps = {
  label: string
  initialValue: boolean
  moreInfoContent?: string
  onCheckChange: (isChecked: boolean) => void
  justifyContent?: FormControlProps['justifyContent']
} & Omit<SwitchProps, 'value' | 'justifyContent'>

export const SwitchWithLabel = ({
  label,
  initialValue,
  moreInfoContent,
  onCheckChange,
  justifyContent = 'space-between',
  ...switchProps
}: SwitchWithLabelProps) => {
  const [isChecked, setIsChecked] = useState(initialValue)

  const handleChange = () => {
    setIsChecked(!isChecked)
    onCheckChange(!isChecked)
  }

  return (
    <FormControl as={HStack} justifyContent={justifyContent}>
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
