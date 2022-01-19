import { Text, Tooltip } from '@chakra-ui/react'
import {
  BubbleStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  StepType,
} from 'models'
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
    case InputStepType.URL: {
      return <Text>Website</Text>
    }
    case InputStepType.DATE: {
      return <Text>Date</Text>
    }
    case InputStepType.PHONE: {
      return <Text>Phone</Text>
    }
    case InputStepType.CHOICE: {
      return <Text>Button</Text>
    }
    case LogicStepType.SET_VARIABLE: {
      return <Text>Set variable</Text>
    }
    case LogicStepType.CONDITION: {
      return <Text>Condition</Text>
    }
    case IntegrationStepType.GOOGLE_SHEETS: {
      return (
        <Tooltip label="Google Sheets">
          <Text>Sheets</Text>
        </Tooltip>
      )
    }
    case IntegrationStepType.GOOGLE_ANALYTICS: {
      return (
        <Tooltip label="Google Analytics">
          <Text>Analytics</Text>
        </Tooltip>
      )
    }
    default: {
      return <></>
    }
  }
}
