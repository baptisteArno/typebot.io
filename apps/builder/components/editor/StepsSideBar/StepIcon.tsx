import { IconProps } from '@chakra-ui/react'
import {
  CalendarIcon,
  CheckSquareIcon,
  CodeIcon,
  CreditCardIcon,
  EditIcon,
  EmailIcon,
  ExternalLinkIcon,
  FilmIcon,
  FilterIcon,
  FlagIcon,
  LayoutIcon,
  PhoneIcon,
  SendEmailIcon,
  WavingHandIcon,
  AssignToIcon,
  TextIcon,
  WebhookIcon,
  ListIcon,
  ContactCardIcon,
  AskNameIcon,
  PreReserveIcon,
  QuestionIcon,
  CallBotIcon,
  CommerceIcon,
  WandIcon,
  ConversationTagIcon,
} from 'assets/icons'
import {
  BubbleStepType,
  InputStepType,
  OctaStepType,
  OctaBubbleStepType,
  IntegrationStepType,
  LogicStepType,
  StepType,
  OctaWabaStepType,
  WOZStepType
} from 'models'
import React from 'react'


type StepIconProps = { type: StepType } & IconProps

export const StepIcon = ({ type, ...props }: StepIconProps) => {

  switch (type) {
    case BubbleStepType.TEXT:
      return <TextIcon color="#AA561C" {...props} />
    case WOZStepType.MESSAGE:
      return <WandIcon color="#AA561C" {...props} />
    case WOZStepType.ASSIGN:
      return <AssignToIcon color="#AA561C" {...props} />
    case BubbleStepType.MEDIA:
      return <LayoutIcon color="#AA561C" {...props} />
    case BubbleStepType.VIDEO:
      return <FilmIcon color="#AA561C" {...props} />
    case BubbleStepType.EMBED:
      return <LayoutIcon color="#AA561C"  {...props} />
    case InputStepType.TEXT:
      return <QuestionIcon color="#256F42" {...props} />
    case InputStepType.EMAIL:
      return <EmailIcon color="#256F42" {...props} />
    case InputStepType.CPF:
      return <ContactCardIcon color="#256F42" {...props} />
    // case InputStepType.URL:
    //   return <GlobeIcon color="#256F42" {...props} />
    case InputStepType.DATE:
      return <CalendarIcon color="#256F42" {...props} />
    case InputStepType.PHONE:
      return <PhoneIcon color="#256F42" {...props} />
    case InputStepType.CHOICE:
      return <CheckSquareIcon color="#256F42" {...props} />
    case InputStepType.PAYMENT:
      return <CreditCardIcon color="orange.500" {...props} />
    case InputStepType.ASK_NAME:
      return <AskNameIcon color="#256F42" {...props} />
    case LogicStepType.SET_VARIABLE:
      return <EditIcon color="purple.500" {...props} />
    case LogicStepType.CONDITION:
      return <FilterIcon color="#AE285E" {...props} />
    case LogicStepType.REDIRECT:
      return <ExternalLinkIcon color="purple.500" {...props} />
    case LogicStepType.CODE:
      return <CodeIcon color="purple.500" {...props} />
    case IntegrationStepType.WEBHOOK:
      return <WebhookIcon {...props} />
      return <SendEmailIcon {...props} />
    case OctaBubbleStepType.END_CONVERSATION:
      return <WavingHandIcon color="#373A86" {...props} />
    case OctaStepType.ASSIGN_TO_TEAM:
      return <AssignToIcon color="#373A86" {...props} />
    case OctaStepType.CALL_OTHER_BOT:
      return <CallBotIcon color="#373A86" {...props} />
    // case OctaWabaStepType.BUTTONS:
    //   return <RadioIcon color="#7B15C1" {...props} />
    case OctaWabaStepType.WHATSAPP_OPTIONS_LIST:
      return <ListIcon color="#256F42" {...props} />
    case OctaWabaStepType.WHATSAPP_BUTTONS_LIST:
      return <CodeIcon color="#256F42" {...props} />
    case OctaStepType.OFFICE_HOURS:
      return <CalendarIcon color="#373A86" />
    case OctaWabaStepType.COMMERCE:
      return <CommerceIcon color="#AA561C" />
    case OctaStepType.PRE_RESERVE:
      return <PreReserveIcon color="#373A86" {...props} />
    case OctaStepType.CONVERSATION_TAG:
      return <ConversationTagIcon color="#373A86" {...props} />      
    case 'start':
      return <FlagIcon {...props} />
    default:
      return <></>
  }
}
