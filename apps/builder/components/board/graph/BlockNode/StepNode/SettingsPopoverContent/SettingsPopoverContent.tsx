import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
  IconButton,
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
  TextBubbleStep,
  Webhook,
  WebhookStep,
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
import { SetVariableSettingsBody } from './bodies/SetVariableSettingsBody'
import { WebhookSettings } from './bodies/WebhookSettings'

type Props = {
  step: Exclude<Step, TextBubbleStep>
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
      <PopoverContent onMouseDown={handleMouseDown} pos="relative">
        <PopoverArrow />
        <PopoverBody
          py="6"
          overflowY="scroll"
          maxH="400px"
          ref={ref}
          shadow="lg"
        >
          <StepSettings step={step} />
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

export const StepSettings = ({ step }: { step: Step }) => {
  const { updateStep, updateWebhook, typebot } = useTypebot()
  const handleOptionsChange = (options: StepOptions) => {
    updateStep(step.id, { options } as Partial<InputStep>)
  }

  const handleWebhookChange = (webhook: Partial<Webhook>) => {
    const webhookId = (step as WebhookStep).options?.webhookId
    if (!webhookId) return
    updateWebhook(webhookId, webhook)
  }

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
    case LogicStepType.REDIRECT: {
      return (
        <RedirectSettings
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
    case IntegrationStepType.GOOGLE_ANALYTICS: {
      return (
        <GoogleAnalyticsSettings
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationStepType.WEBHOOK: {
      return (
        <WebhookSettings
          key={step.options?.webhookId}
          options={step.options}
          webhook={typebot?.webhooks.byId[step.options?.webhookId ?? '']}
          onOptionsChange={handleOptionsChange}
          onWebhookChange={handleWebhookChange}
        />
      )
    }
    default: {
      return <></>
    }
  }
}
