import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
  Stack,
  IconButton,
  Flex,
} from '@chakra-ui/react'
import { ExpandIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import {
  InputStep,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  Step,
  StepOptions,
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
import { GoogleSheetsSettingsBody } from './bodies/GoogleSheetsSettingsBody'
import { PhoneNumberSettingsBody } from './bodies/PhoneNumberSettingsBody'
import { SetVariableSettingsBody } from './bodies/SetVariableSettingsBody'

type Props = {
  step: Step
  onExpandClick: () => void
}

export const SettingsPopoverContent = ({ step, onExpandClick }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)
  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown}>
        <PopoverArrow />
        <PopoverBody
          px="6"
          pb="6"
          pt="4"
          overflowY="scroll"
          maxH="400px"
          ref={ref}
          shadow="lg"
        >
          <Stack>
            <Flex justifyContent="flex-end">
              <IconButton
                aria-label="expand"
                icon={<ExpandIcon />}
                size="xs"
                onClick={onExpandClick}
              />
            </Flex>
            <StepSettings step={step} />
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Portal>
  )
}

export const StepSettings = ({ step }: { step: Step }) => {
  const { updateStep } = useTypebot()
  const handleOptionsChange = (options: StepOptions) =>
    updateStep(step.id, { options } as Partial<InputStep>)

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
    case IntegrationStepType.GOOGLE_SHEETS: {
      return (
        <GoogleSheetsSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
          stepId={step.id}
        />
      )
    }
    default: {
      return <></>
    }
  }
}
