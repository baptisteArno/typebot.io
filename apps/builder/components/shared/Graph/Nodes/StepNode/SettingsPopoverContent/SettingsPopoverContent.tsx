import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
  IconButton,
} from '@chakra-ui/react'
import { ExpandIcon } from 'assets/icons'
import {
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  Step,
  StepOptions,
  TextBubbleStep,
  Webhook,
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
import { GoogleAnalyticsSettings } from './bodies/GoogleAnalyticsSettings'
import { GoogleSheetsSettingsBody } from './bodies/GoogleSheetsSettingsBody'
import { PhoneNumberSettingsBody } from './bodies/PhoneNumberSettingsBody'
import { RedirectSettings } from './bodies/RedirectSettings'
import { SetVariableSettings } from './bodies/SetVariableSettings'
import { WebhookSettings } from './bodies/WebhookSettings'

type Props = {
  step: Exclude<Step, TextBubbleStep>
  webhook?: Webhook
  onExpandClick: () => void
  onOptionsChange: (options: StepOptions) => void
  onWebhookChange: (updates: Partial<Webhook>) => void
  onTestRequestClick: () => void
}

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)
  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown} pos="relative">
        <PopoverArrow />
        <PopoverBody
          py="6"
          overflowY="scroll"
          maxH="400px"
          ref={ref}
          shadow="lg"
        >
          <StepSettings {...props} />
        </PopoverBody>
        <IconButton
          pos="absolute"
          top="5px"
          right="5px"
          aria-label="expand"
          icon={<ExpandIcon />}
          size="xs"
          onClick={onExpandClick}
        />
      </PopoverContent>
    </Portal>
  )
}

export const StepSettings = ({
  step,
  webhook,
  onOptionsChange,
  onWebhookChange,
  onTestRequestClick,
}: {
  step: Step
  webhook?: Webhook
  onOptionsChange: (options: StepOptions) => void
  onWebhookChange: (updates: Partial<Webhook>) => void
  onTestRequestClick: () => void
}) => {
  switch (step.type) {
    case InputStepType.TEXT: {
      return (
        <TextInputSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case InputStepType.NUMBER: {
      return (
        <NumberInputSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case InputStepType.EMAIL: {
      return (
        <EmailInputSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case InputStepType.URL: {
      return (
        <UrlInputSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case InputStepType.DATE: {
      return (
        <DateInputSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case InputStepType.PHONE: {
      return (
        <PhoneNumberSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case InputStepType.CHOICE: {
      return (
        <ChoiceInputSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case LogicStepType.SET_VARIABLE: {
      return (
        <SetVariableSettings
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case LogicStepType.CONDITION: {
      return (
        <ConditionSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case LogicStepType.REDIRECT: {
      return (
        <RedirectSettings
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case IntegrationStepType.GOOGLE_SHEETS: {
      return (
        <GoogleSheetsSettingsBody
          options={step.options}
          onOptionsChange={onOptionsChange}
          stepId={step.id}
        />
      )
    }
    case IntegrationStepType.GOOGLE_ANALYTICS: {
      return (
        <GoogleAnalyticsSettings
          options={step.options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case IntegrationStepType.WEBHOOK: {
      return (
        <WebhookSettings
          options={step.options}
          webhook={webhook as Webhook}
          onOptionsChange={onOptionsChange}
          onWebhookChange={onWebhookChange}
          onTestRequestClick={onTestRequestClick}
        />
      )
    }
    default: {
      return <></>
    }
  }
}
