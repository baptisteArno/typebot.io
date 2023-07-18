import { Text, Tooltip } from '@chakra-ui/react'
import {
  BubbleStepType,
  OctaStepType,
  OctaBubbleStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  StepType,
  OctaWabaStepType,
} from 'models'
import React from 'react'

type Props = { type: StepType }

export const StepTypeHelper = ({ type }: Props) => {
  switch (type) {
    default:
      return (
        <></>
      )
  }
}
