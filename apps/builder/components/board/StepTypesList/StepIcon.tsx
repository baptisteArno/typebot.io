import { IconProps } from '@chakra-ui/react'
import {
  CalendarIcon,
  ChatIcon,
  CheckSquareIcon,
  EmailIcon,
  FlagIcon,
  GlobeIcon,
  NumberIcon,
  PhoneIcon,
  TextIcon,
} from 'assets/icons'
import { BubbleStepType, InputStepType, StepType } from 'models'
import React from 'react'

type StepIconProps = { type: StepType } & IconProps

export const StepIcon = ({ type, ...props }: StepIconProps) => {
  switch (type) {
    case BubbleStepType.TEXT: {
      return <ChatIcon {...props} />
    }
    case InputStepType.TEXT: {
      return <TextIcon {...props} />
    }
    case InputStepType.NUMBER: {
      return <NumberIcon {...props} />
    }
    case InputStepType.EMAIL: {
      return <EmailIcon {...props} />
    }
    case InputStepType.URL: {
      return <GlobeIcon {...props} />
    }
    case InputStepType.DATE: {
      return <CalendarIcon {...props} />
    }
    case InputStepType.PHONE: {
      return <PhoneIcon {...props} />
    }
    case InputStepType.CHOICE: {
      return <CheckSquareIcon {...props} />
    }
    case 'start': {
      return <FlagIcon {...props} />
    }
    default: {
      return <></>
    }
  }
}
