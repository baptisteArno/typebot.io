import { Text } from '@chakra-ui/react'
import {
  Step,
  StartStep,
  BubbleStepType,
  InputStepType,
  LogicStepType,
  IntegrationStepType,
  StepIndices,
  OctaBubbleStepType,
  OctaStepType,
  OctaWabaStepType,
} from 'models'
import { isChoiceInput, isInputStep } from 'utils'
import { ItemNodesList } from '../../../ItemNode'

import {
  EmbedBubbleContent,
  // SetVariableContent,
  TextBubbleContent,
  VideoBubbleContent,
  WebhookContent,
  WithVariableContent,
} from '../contents'
import { AssignToTeamContent } from '../contents/AssignToTeam/AssignToTeamContent'
import { CallOtherBotContent } from '../contents/CallOtherBot/CallOtherBotContent'
// import { WhatsAppOptionsContent } from '../contents/WhatsAppOptions/'
// import { ConfigureContent } from './contents/ConfigureContent'
import { ImageBubbleContent } from '../contents/ImageBubbleContent'
import { OctaCommerceContent } from '../contents/OctaCommerceContent'
import { WhatsAppOptionsContent } from '../contents/WhatsApp/WhatsAppOptions'
import { WhatsAppButtonsContent } from '../contents/WhatsApp/WhatsAppButtons'
import {  } from '../contents/WhatsApp/WhatsAppOptions'
// import { PaymentInputContent } from './contents/PaymentInputContent'
import { PlaceholderContent } from '../contents/PlaceholderContent'
// import { SendEmailContent } from './contents/SendEmailContent'
import { TypebotLinkContent } from '../contents/TypebotLinkContent'
// import { ProviderWebhookContent } from './contents/ZapierContent'

type Props = {
  step: Step;
  indices: StepIndices
}
export const StepNodeContent = ({ step, indices }: Props) => {
  if (isInputStep(step) && !isChoiceInput(step) && step.options.variableId) {
    return <WithVariableContent variableId={step.options.variableId} />
  }
  switch (step.type) {
    case BubbleStepType.TEXT: {
      return <TextBubbleContent step={step} />
    }
    case BubbleStepType.MEDIA: {
      return <ImageBubbleContent step={step} />
    }
    case InputStepType.TEXT: {
      return (
        <PlaceholderContent
          placeholder={step.options.labels.placeholder}
          isLong={step.options.isLong}
        />
      )
    }
    case InputStepType.NUMBER:
    case InputStepType.EMAIL:
    case InputStepType.CPF:
    // case InputStepType.URL:
    case InputStepType.PHONE: {
      return (
        <PlaceholderContent placeholder={step.options.labels.placeholder} />
      )
    }
    case InputStepType.DATE: {
      return <Text color={'gray.500'} ml={'8px'}>Informe uma data, por favor...</Text>
    }
    case InputStepType.CHOICE: {
      return <ItemNodesList step={step} indices={indices} />
    }
    // case InputStepType.PAYMENT: {
    //   return <PaymentInputContent step={step} />
    // }
    case InputStepType.ASK_NAME: {
      return (
        <PlaceholderContent
          placeholder={step.options.labels.placeholder}
          isLong={step.options.isLong}
        />
      )
    }
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
        <AssignToTeamContent step={step} options={step.options.labels} />
      )
    }
    case OctaStepType.CALL_OTHER_BOT: {
      return (
        <CallOtherBotContent step={step} options={step.options.botToCall} />
      )
    }
    case OctaStepType.OFFICE_HOURS: {     
      return <ItemNodesList step={step} indices={indices} isReadOnly />
    }
    case OctaWabaStepType.WHATSAPP_OPTIONS_LIST: {     
      return <WhatsAppOptionsContent step={step} indices={indices} />
    }
    case OctaStepType.COMMERCE: {
      return <OctaCommerceContent options={step.options} />
    }
    case OctaWabaStepType.WHATSAPP_BUTTONS_LIST: {     
      return <WhatsAppButtonsContent step={step} indices={indices} />
    }
    // case OctaWabaStepType.COMMERCE: {
    //   return <OctaCommerceContent step={step} options={step} />
    // }
    case 'start': {
      return <Text>Início</Text>
    }
    default: {
      return <Text>Sem dado</Text>
    }
  }
}
