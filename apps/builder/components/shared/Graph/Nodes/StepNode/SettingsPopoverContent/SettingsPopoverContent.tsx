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
  OctaStepType,
  Step,
  StepOptions,
  TextBubbleStep,
  Webhook,
  OctaWabaStepType,
  BubbleStepType,
  MediaBubbleContent,
  WOZStepType,
} from 'models'
import { useRef } from 'react'
import {
  UrlInputSettingsBody,
  AssignToTeamSettingsBody,
  PreReserveSettingsBody,
  CallOtherBotSettingsBody,
  WhatsAppOptionsListSettingsBody,
  WhatsAppButtonsListSettingsBody,
  WOZSuggestionSettingBody,
  WOZAssignSettingBody,
  ConversationTagBody,
} from './bodies'
import { ChoiceInputSettingsBody } from './bodies/ChoiceInputSettingsBody'
import { CodeSettings } from './bodies/CodeSettings'
import { ConditionSettingsBody } from './bodies/ConditionSettingsBody'
import { OctaCommerceBody } from './bodies/OctaCommerceBody'
import { OfficeHoursBody } from './bodies/OfficeHoursBody'
import { PaymentSettings } from './bodies/PaymentSettings'
import { RedirectSettings } from './bodies/RedirectSettings'
import { TypebotLinkSettingsForm } from './bodies/TypebotLinkSettingsForm'
import { WebhookSettings } from './bodies/WebhookSettings'
import { InputSettingBody } from './bodies/InputSettingsBody'
import { InputMediaSettingBody } from './bodies/InputMediaSettingsBody'

type Props = {
  step: Exclude<Step, TextBubbleStep>
  onExpandClick: () => void
  onStepChange: (updates: Partial<Step>) => void
}

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)

  const handleWidthPerComponent = (step: Step): number | undefined => {
    let width
    switch (step.type) {
      case OctaWabaStepType.WHATSAPP_BUTTONS_LIST:
      case OctaWabaStepType.WHATSAPP_OPTIONS_LIST:
      case OctaStepType.OFFICE_HOURS:
      case OctaWabaStepType.COMMERCE:
        width = 450
        break
      case IntegrationStepType.WEBHOOK:
        width = 500
        break
      case LogicStepType.CONDITION:
      case OctaStepType.ASSIGN_TO_TEAM:
      case OctaStepType.CALL_OTHER_BOT:
      case OctaStepType.CONVERSATION_TAG:
        width = 450
        break
      default:
        width = undefined
        break
    }
    return width
  }

  const handleHeightPerComponent = (step: Step): number | undefined => {
    let height
    switch (step.type) {
      case OctaStepType.CALL_OTHER_BOT:
        height = 400
        break
      case OctaWabaStepType.WHATSAPP_OPTIONS_LIST:
        height = 800
        break
      default:
        height = undefined
        break
    }
    return height
  }

  return (
    <Portal>
      <PopoverContent
        onMouseDown={handleMouseDown}
        pos="relative"
        w={handleWidthPerComponent(props.step)}
      >
        <PopoverArrow />
        <PopoverBody
          pt="10"
          pb="6"
          overflowY="scroll"
          maxH="700px"
          ref={ref}
          shadow="lg"
          h={handleHeightPerComponent(props.step)}
        >
          <StepSettings {...props} />
        </PopoverBody>
        <IconButton
          pos="absolute"
          top="5px"
          right="20px"
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
  onStepChange,
}: {
  step: Step
  webhook?: Webhook
  onStepChange: (step: Partial<Step>) => void
}) => {
  const handleContentChange = (content: MediaBubbleContent) => {
    onStepChange({ content } as Partial<Step>)
  }
  const handleOptionsChange = (options: StepOptions) => {
    onStepChange({ options } as Partial<Step>)
  }
  const handleItemChange = (updates: Partial<any>) => {
    onStepChange({
      items: [{ ...(step as any).items[0], ...updates }],
    } as Partial<Step>)
  }

  switch (step.type) {
    case InputStepType.URL: {
      return (
        <UrlInputSettingsBody
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
    case InputStepType.PAYMENT: {
      return (
        <PaymentSettings
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicStepType.CONDITION: {
      return (
        <ConditionSettingsBody step={step} onItemChange={handleItemChange} />
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
    case LogicStepType.CODE: {
      return (
        <CodeSettings
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicStepType.TYPEBOT_LINK: {
      return (
        <TypebotLinkSettingsForm
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaStepType.ASSIGN_TO_TEAM: {
      return (
        <AssignToTeamSettingsBody
          options={
            step.options || { labels: { placeholder: 'sou um placeholder' } }
          }
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaStepType.PRE_RESERVE: {
      return (
        <PreReserveSettingsBody
          options={
            step.options || { labels: { placeholder: 'sou um placeholder' } }
          }
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case WOZStepType.MESSAGE: {
      return (
        <WOZSuggestionSettingBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case WOZStepType.ASSIGN: {
      return (
        <WOZAssignSettingBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaStepType.CALL_OTHER_BOT: {
      return (
        <CallOtherBotSettingsBody
          options={step.options || { botToCall: '1' }}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaStepType.OFFICE_HOURS: {
      return (
        <OfficeHoursBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaWabaStepType.COMMERCE: {
      return (
        <OctaCommerceBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaStepType.CONVERSATION_TAG: {
      return (
        <ConversationTagBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaWabaStepType.WHATSAPP_OPTIONS_LIST: {
      return (
        <WhatsAppOptionsListSettingsBody
          options={step.options || { name: '' }}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaWabaStepType.WHATSAPP_BUTTONS_LIST: {
      return (
        <WhatsAppButtonsListSettingsBody
          options={step.options || { name: '' }}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationStepType.WEBHOOK: {
      return (
        <WebhookSettings step={step} onOptionsChange={handleOptionsChange} />
      )
    }
    case InputStepType.ASK_NAME:
    case InputStepType.EMAIL:
    case InputStepType.TEXT:
    case InputStepType.PHONE:
    case InputStepType.DATE:
    case InputStepType.CPF: {
      return (
        <InputSettingBody step={step} onOptionsChange={handleOptionsChange} />
      )
    }
    case BubbleStepType.MEDIA: {
      return (
        <InputMediaSettingBody
          step={step}
          onContentChange={handleContentChange}
        />
      )
    }
    default:
      return <span></span>
  }
}
