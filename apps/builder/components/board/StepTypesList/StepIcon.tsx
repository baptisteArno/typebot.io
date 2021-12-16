import { CalendarIcon, FlagIcon, ImageIcon, TextIcon } from 'assets/icons'
import { StepType } from 'bot-engine'
import React from 'react'

type StepIconProps = { type: StepType }

export const StepIcon = ({ type }: StepIconProps) => {
  switch (type) {
    case StepType.TEXT: {
      return <TextIcon />
    }
    case StepType.IMAGE: {
      return <ImageIcon />
    }
    case StepType.DATE_PICKER: {
      return <CalendarIcon />
    }
    case StepType.START: {
      return <FlagIcon />
    }
    default: {
      return <TextIcon />
    }
  }
}
