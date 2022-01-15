import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
} from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import {
  ChoiceInputOptions,
  ConditionOptions,
  InputStep,
  InputStepType,
  LogicStepType,
  SetVariableOptions,
  Step,
  TextInputOptions,
} from 'models'
import { useRef } from 'react'
import {
  TextInputSettingsBody,
  NumberInputSettingsBody,
  EmailInputSettingsBody,
  UrlInputSettingsBody,
  DateInputSettingsBody,
} from './bodies'
import { ChoiceInputSettingsBody } from './bodies/ChoiceInputSettingsBody'
import { ConditionSettingsBody } from './bodies/ConditionSettingsBody'
import { PhoneNumberSettingsBody } from './bodies/PhoneNumberSettingsBody'
import { SetVariableSettingsBody } from './bodies/SetVariableSettingsBody'

type Props = {
  step: Step
}

export const SettingsPopoverContent = ({ step }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)
  return (
    <PopoverContent onMouseDown={handleMouseDown}>
      <PopoverArrow />
      <PopoverBody p="6" overflowY="scroll" maxH="400px" ref={ref}>
        <SettingsPopoverBodyContent step={step} />
      </PopoverBody>
    </PopoverContent>
  )
}

const SettingsPopoverBodyContent = ({ step }: Props) => {
  const { updateStep } = useTypebot()
  const handleOptionsChange = (
    options:
      | TextInputOptions
      | ChoiceInputOptions
      | SetVariableOptions
      | ConditionOptions
  ) => updateStep(step.id, { options } as Partial<InputStep>)

  switch (step.type) {
    case InputStepType.TEXT: {
      return (
        <TextInputSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputStepType.NUMBER: {
      return (
        <NumberInputSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputStepType.EMAIL: {
      return (
        <EmailInputSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputStepType.URL: {
      return (
        <UrlInputSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputStepType.DATE: {
      return (
        <DateInputSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputStepType.PHONE: {
      return (
        <PhoneNumberSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputStepType.CHOICE: {
      return (
        <ChoiceInputSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicStepType.SET_VARIABLE: {
      return (
        <SetVariableSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicStepType.CONDITION: {
      return (
        <ConditionSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    default: {
      return <></>
    }
  }
}
