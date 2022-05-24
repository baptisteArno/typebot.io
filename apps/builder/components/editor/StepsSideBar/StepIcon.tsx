import { IconProps } from '@chakra-ui/react'
import {
  BoxIcon,
  CalendarIcon,
  ChatIcon,
  CheckSquareIcon,
  CodeIcon,
  CreditCardIcon,
  EditIcon,
  EmailIcon,
  ExternalLinkIcon,
  FilmIcon,
  FilterIcon,
  FlagIcon,
  GlobeIcon,
  ImageIcon,
  LayoutIcon,
  NumberIcon,
  PhoneIcon,
  SendEmailIcon,
  TextIcon,
  WebhookIcon,
} from 'assets/icons'
import {
  GoogleAnalyticsLogo,
  GoogleSheetsLogo,
  MakeComLogo,
  PabblyConnectLogo,
  ZapierLogo,
} from 'assets/logos'
import {
  BubbleStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  StepType,
} from 'models'
import React from 'react'

type StepIconProps = { type: StepType } & IconProps

export const StepIcon = ({ type, ...props }: StepIconProps) => {
  switch (type) {
    case BubbleStepType.TEXT:
      return <ChatIcon color="blue.500" {...props} />
    case BubbleStepType.IMAGE:
      return <ImageIcon color="blue.500" {...props} />
    case BubbleStepType.VIDEO:
      return <FilmIcon color="blue.500" {...props} />
    case BubbleStepType.EMBED:
      return <LayoutIcon color="blue.500" {...props} />
    case InputStepType.TEXT:
      return <TextIcon color="orange.500" {...props} />
    case InputStepType.NUMBER:
      return <NumberIcon color="orange.500" {...props} />
    case InputStepType.EMAIL:
      return <EmailIcon color="orange.500" {...props} />
    case InputStepType.URL:
      return <GlobeIcon color="orange.500" {...props} />
    case InputStepType.DATE:
      return <CalendarIcon color="orange.500" {...props} />
    case InputStepType.PHONE:
      return <PhoneIcon color="orange.500" {...props} />
    case InputStepType.CHOICE:
      return <CheckSquareIcon color="orange.500" {...props} />
    case InputStepType.PAYMENT:
      return <CreditCardIcon color="orange.500" {...props} />
    case LogicStepType.SET_VARIABLE:
      return <EditIcon color="purple.500" {...props} />
    case LogicStepType.CONDITION:
      return <FilterIcon color="purple.500" {...props} />
    case LogicStepType.REDIRECT:
      return <ExternalLinkIcon color="purple.500" {...props} />
    case LogicStepType.CODE:
      return <CodeIcon color="purple.500" {...props} />
    case LogicStepType.TYPEBOT_LINK:
      return <BoxIcon color="purple.500" {...props} />
    case IntegrationStepType.GOOGLE_SHEETS:
      return <GoogleSheetsLogo {...props} />
    case IntegrationStepType.GOOGLE_ANALYTICS:
      return <GoogleAnalyticsLogo {...props} />
    case IntegrationStepType.WEBHOOK:
      return <WebhookIcon {...props} />
    case IntegrationStepType.ZAPIER:
      return <ZapierLogo {...props} />
    case IntegrationStepType.MAKE_COM:
      return <MakeComLogo {...props} />
    case IntegrationStepType.PABBLY_CONNECT:
      return <PabblyConnectLogo {...props} />
    case IntegrationStepType.EMAIL:
      return <SendEmailIcon {...props} />
    case 'start':
      return <FlagIcon {...props} />
    default:
      return <></>
  }
}
