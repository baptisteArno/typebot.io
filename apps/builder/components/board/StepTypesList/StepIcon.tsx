import { ChatIcon, FlagIcon, TextIcon } from 'assets/icons'
import { StepType } from 'models'
import React from 'react'

type StepIconProps = { type: StepType }

export const StepIcon = ({ type }: StepIconProps) => {
  switch (type) {
    case StepType.TEXT: {
      return <ChatIcon />
    }
    case StepType.TEXT: {
      return <TextIcon />
    }
    case StepType.START: {
      return <FlagIcon />
    }
    default: {
      return <TextIcon />
    }
  }
}
