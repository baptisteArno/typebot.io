import { ChatIcon, FlagIcon, NumberIcon, TextIcon } from 'assets/icons'
import { BubbleStepType, InputStepType, StepType } from 'models'
import React from 'react'

type StepIconProps = { type: StepType }

export const StepIcon = ({ type }: StepIconProps) => {
  switch (type) {
    case BubbleStepType.TEXT: {
      return <ChatIcon />
    }
    case InputStepType.TEXT: {
      return <TextIcon />
    }
    case InputStepType.NUMBER: {
      return <NumberIcon />
    }
    case 'start': {
      return <FlagIcon />
    }
    default: {
      return <></>
    }
  }
}
