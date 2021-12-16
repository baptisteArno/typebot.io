import { Text } from '@chakra-ui/react'
import { StepType } from 'bot-engine'
import React from 'react'

type Props = { type: StepType }

export const StepLabel = ({ type }: Props) => {
  switch (type) {
    case StepType.TEXT: {
      return <Text>Text</Text>
    }
    case StepType.IMAGE: {
      return <Text>Image</Text>
    }
    case StepType.DATE_PICKER: {
      return <Text>Date</Text>
    }
    default: {
      return <></>
    }
  }
}
