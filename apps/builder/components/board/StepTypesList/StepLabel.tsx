import { Text } from '@chakra-ui/react'
import { StepType } from 'models'
import React from 'react'

type Props = { type: StepType }

export const StepLabel = ({ type }: Props) => {
  switch (type) {
    case StepType.TEXT: {
      return <Text>Text</Text>
    }
    case StepType.TEXT_INPUT: {
      return <Text>Text</Text>
    }
    default: {
      return <></>
    }
  }
}
