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
  ConditionItem,
  ConditionStep,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  OctaStepType,
  OctaBubbleStepType,
  Step,
  StepOptions,
  TextBubbleStep,
  Webhook,
  OctaWabaStepType,
  BubbleStepType,
} from 'models'
import { useRef } from 'react'
import {
  TextInputSettingsBody,
  NumberInputSettingsBody,
  EmailInputSettingsBody,
  CpfInputSettingsBody,
  UrlInputSettingsBody,
  DateInputSettingsBody,
  AssignToTeamSettingsBody,
  CallOtherBotSettingsBody,
  WhatsAppOptionsListSettingsBody
} from './bodies'
import { ChoiceInputSettingsBody } from './bodies/ChoiceInputSettingsBody'
import { CodeSettings } from './bodies/CodeSettings'
import { ConditionSettingsBody } from './bodies/ConditionSettingsBody'
import { GoogleAnalyticsSettings } from './bodies/GoogleAnalyticsSettings'
import { GoogleSheetsSettingsBody } from './bodies/GoogleSheetsSettingsBody'
import { OctaCommerceBody } from './bodies/OctaCommerceBody'
import { OfficeHoursBody } from './bodies/OfficeHoursBody'
import { PaymentSettings } from './bodies/PaymentSettings'
import { PhoneNumberSettingsBody } from './bodies/PhoneNumberSettingsBody'
import { RedirectSettings } from './bodies/RedirectSettings'
import { SendEmailSettings } from './bodies/SendEmailSettings'
import { SetVariableSettings } from './bodies/SetVariableSettings'
import { TypebotLinkSettingsForm } from './bodies/TypebotLinkSettingsForm'
import { WebhookSettings } from './bodies/WebhookSettings'
import { ZapierSettings } from './bodies/ZapierSettings'

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

  const handleWidthPerComponent = (step: Step): number|undefined => {
    let width;
    switch (step.type) {
      case OctaStepType.OFFICE_HOURS:
        width = 450;
        break;
      case OctaWabaStepType.WHATSAPP_OPTIONS_LIST:
        width = 450;
        break;
      // case OctaWabaStepType.COMMERCE:
      //   width = 450;
      //   break;
      case LogicStepType.CONDITION:
        width = 450;
        break;
      case OctaStepType.ASSIGN_TO_TEAM:
        width = 450;
        break;
      case OctaStepType.CALL_OTHER_BOT:
        width = 450;
        break;
      default:
        width = undefined
        break;
    }
    return width;
  }

  const handleHeightPerComponent = (step: Step): number|undefined => {
    let height;
    switch (step.type) {
      case OctaStepType.CALL_OTHER_BOT:
        height = 400;
        break;
      case OctaWabaStepType.WHATSAPP_OPTIONS_LIST:
        height = 800;
        break;
      default:
        height = undefined
        break;
    }
    return height;
  }
  
  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown} pos="relative" w={handleWidthPerComponent(props.step)}>
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
  onStepChange,
}: {
  step: Step
  webhook?: Webhook
  onStepChange: (step: Partial<Step>) => void
}) => {
  const handleOptionsChange = (options: StepOptions) => {
    onStepChange({ options } as Partial<Step>)
  }
  const handleItemChange = (updates: Partial<any>) => {
    onStepChange({
      items: [{ ...(step as any).items[0], ...updates }],
    } as Partial<Step>)
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
    case InputStepType.CPF: {
      return (
        <CpfInputSettingsBody
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
    case InputStepType.PAYMENT: {
      return (
        <PaymentSettings
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputStepType.ASK_NAME: {
      return (
        <TextInputSettingsBody
          options={step.options || { variableId: '2' } }
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    // case LogicStepType.SET_VARIABLE: {
    //   return (
    //     <SetVariableSettings
    //       options={step.options}
    //       onOptionsChange={handleOptionsChange}
    //     />
    //   )
    // }
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
    case OctaStepType.CALL_OTHER_BOT: {
      return (
        <CallOtherBotSettingsBody
          options={
            step.options || { botToCall: '1' }
          }
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case OctaStepType.OFFICE_HOURS: {
      return (
        <OfficeHoursBody step={step} onOptionsChange={handleOptionsChange} />
      )
    }
    case OctaWabaStepType.WHATSAPP_OPTIONS_LIST: {
      return (
        <WhatsAppOptionsListSettingsBody
          options={
            step.options || { name: '' }
          }
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    // case OctaWabaStepType.COMMERCE: {
    //   return (
    //     <OctaCommerceBody step={step} onOptionsChange={handleOptionsChange} />
    //   )
    // }
    case IntegrationStepType.WEBHOOK: {
      return (
        <WebhookSettings step={step} onOptionsChange={handleOptionsChange} />
      )
    }
    default: {
      return <></>
    }
  }
}
