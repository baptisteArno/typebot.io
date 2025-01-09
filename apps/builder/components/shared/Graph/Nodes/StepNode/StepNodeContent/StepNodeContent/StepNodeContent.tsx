import { Text } from '@chakra-ui/react'
import {
  BubbleStepType,
  InputOptions,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  OctaBubbleStepType,
  OctaStepType,
  OctaWabaStepType,
  Step,
  StepIndices,
  StepWithOptions,
  WOZStepType,
} from 'models'
import { ItemNodesList } from '../../../ItemNode'

import {
  // SetVariableContent,
  TextBubbleContent,
} from '../contents'
import { AssignToTeamContent } from '../contents/AssignToTeam/AssignToTeamContent'
import { CallOtherBotContent } from '../contents/CallOtherBot/CallOtherBotContent'
// import { WhatsAppOptionsContent } from '../contents/WhatsAppOptions/'
// import { ConfigureContent } from './contents/ConfigureContent'
import { OctaCommerceContent } from '../contents/OctaCommerceContent'
import { WhatsAppButtonsContent } from '../contents/WhatsApp/WhatsAppButtons'
import { WhatsAppOptionsContent } from '../contents/WhatsApp/WhatsAppOptions'
// import { PaymentInputContent } from './contents/PaymentInputContent'
// import { SendEmailContent } from './contents/SendEmailContent'
import { useTypebot } from 'contexts/TypebotContext'
import { ConversationTagContent } from '../contents/ConversationTag'
import { InputContent } from '../contents/Input'
import { InputItemsContent } from '../contents/InputItemsContent'
import { MediaInputContent } from '../contents/MediaInput'
import { PreReserveContent } from '../contents/PreReserve'
import { WOZAssignContent } from '../contents/WOZAssign'
import { WOZSuggestionContent } from '../contents/WOZSuggestion'
// import { ProviderWebhookContent } from './contents/ZapierContent'

type Props = {
  step: Step;
  indices: StepIndices
}
export const StepNodeContent = ({ step, indices }: Props) => {
  const { updateStep } = useTypebot()
  const handleStepUpdate = (options: InputOptions): void => {
    const stepWithOptions = step as StepWithOptions
    if (stepWithOptions.options) {
      stepWithOptions.options = { ...stepWithOptions.options, ...options }
      updateStep(indices, { ...stepWithOptions })
    }
  }

  // if (isInputStep(step) && !isChoiceInput(step) && step.options.variableId) {
  //   return <WithVariableContent variableId={step.options.variableId} />
  // }
  switch (step.type) {
    case BubbleStepType.TEXT: {
      return <TextBubbleContent step={step} />
    }
    case BubbleStepType.MEDIA:
      return (
        <MediaInputContent step={step} />
      )
    case InputStepType.TEXT:
    case InputStepType.ASK_NAME:
    case InputStepType.EMAIL:
    case InputStepType.CPF:
    case InputStepType.DATE:
    case InputStepType.PHONE: {
      return (
        <InputContent
          step={step} onUpdateStep={handleStepUpdate}
        />
      )
    }
    case InputStepType.CHOICE: {
      return <InputItemsContent step={step} indices={indices} />
    }
    // case InputStepType.PAYMENT: {
    //   return <PaymentInputContent step={step} />
    // }
    // case InputStepType.ASK_NAME: {
    //   return (
    //     <div>ASK_NAME</div>
    //     // <PlaceholderContent
    //     //   placeholder={step.options.labels.placeholder}
    //     //   isLong={step.options.isLong}
    //     // />
    //   )
    // }
    // case LogicStepType.SET_VARIABLE: {
    //   return <SetVariableContent step={step} />
    // }
    case LogicStepType.CONDITION: {
      return <ItemNodesList step={step} indices={indices} isReadOnly />
    }
    // case LogicStepType.REDIRECT: {
    //   return (
    //     <ConfigureContent
    //       label={
    //         step.options?.url ? `Redirect to ${step.options?.url}` : undefined
    //       }
    //     />
    //   )
    // }
    // case LogicStepType.CODE: {
    //   return (
    //     <ConfigureContent
    //       label={
    //         step.options?.content ? `Run ${step.options?.name}` : undefined
    //       }
    //     />
    //   )
    // }

    // case IntegrationStepType.GOOGLE_SHEETS: {
    //   return (
    //     <ConfigureContent
    //       label={
    //         step.options && 'action' in step.options
    //           ? step.options.action
    //           : undefined
    //       }
    //     />
    //   )
    // }
    // case IntegrationStepType.GOOGLE_ANALYTICS: {
    //   return (
    //     <ConfigureContent
    //       label={
    //         step.options?.action
    //           ? `Track "${step.options?.action}" `
    //           : undefined
    //       }
    //     />
    //   )
    // }
    case IntegrationStepType.WEBHOOK: {
      return <ItemNodesList step={step} indices={indices} isReadOnly />
    }
    case IntegrationStepType.EXTERNAL_EVENT: {
      return <ItemNodesList step={step} indices={indices} isReadOnly />
    }
    // case IntegrationStepType.ZAPIER: {
    //   return (
    //     <ProviderWebhookContent step={step} configuredLabel="Trigger zap" />
    //   )
    // }
    // case IntegrationStepType.PABBLY_CONNECT:
    // case IntegrationStepType.MAKE_COM: {
    //   return (
    //     <ProviderWebhookContent
    //       step={step}
    //       configuredLabel="Trigger scenario"
    //     />
    //   )
    // }
    // case IntegrationStepType.EMAIL: {
    //   return <SendEmailContent step={step} />
    // }
    case OctaBubbleStepType.END_CONVERSATION: {
      return <TextBubbleContent step={step} />
    }
    case OctaStepType.ASSIGN_TO_TEAM: {
      return (
        <AssignToTeamContent step={step} />
      )
    }
    case OctaStepType.CALL_OTHER_BOT: {
      return (
        <CallOtherBotContent step={step} options={step.options} />
      )
    }
    case OctaStepType.OFFICE_HOURS: {
      return <ItemNodesList step={step} indices={indices} isReadOnly />
    }
    case OctaWabaStepType.WHATSAPP_OPTIONS_LIST: {
      return <WhatsAppOptionsContent step={step} indices={indices} />
    }
    case OctaWabaStepType.COMMERCE: {
      return <OctaCommerceContent options={step.options} />
    }
    case OctaWabaStepType.WHATSAPP_BUTTONS_LIST: {
      return <WhatsAppButtonsContent step={step} indices={indices} />
    }
    case OctaStepType.PRE_RESERVE: {
      return <PreReserveContent step={step} />
    }
    case WOZStepType.MESSAGE: {
      return <WOZSuggestionContent step={step} />
    }
    case WOZStepType.ASSIGN: {
      return <WOZAssignContent step={step} indices={indices} />
    }
    case OctaStepType.CONVERSATION_TAG: {
      return <ConversationTagContent step={step} />
    }
    case 'start': {
      return <span></span>
    }
    default: {
      return <Text>Sem dado</Text>
    }
  }
}
