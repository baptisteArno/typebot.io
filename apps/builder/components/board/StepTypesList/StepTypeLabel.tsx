import { Text } from '@chakra-ui/react'
import { BubbleStepType, InputStepType, StepType } from 'models'
import React from 'react'

type Props = { type: StepType }

export const StepTypeLabel = ({ type }: Props) => {
  switch (type) {
    case BubbleStepType.TEXT:
    case InputStepType.TEXT: {
      return <Text>Text</Text>
    }
    case InputStepType.NUMBER: {
      return <Text>Number</Text>
    }
    case InputStepType.EMAIL: {
      return <Text>Email</Text>
    }
    default: {
      return <></>
    }
  }
}
