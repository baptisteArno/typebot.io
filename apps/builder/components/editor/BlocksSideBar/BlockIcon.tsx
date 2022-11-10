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
  StarIcon,
  TextIcon,
  UploadIcon,
  WebhookIcon,
} from 'assets/icons'
import {
  GoogleAnalyticsLogo,
  GoogleSheetsLogo,
  MakeComLogo,
  PabblyConnectLogo,
  ZapierLogo,
} from 'assets/logos'
import { ChatwootLogo } from 'features/chatwoot'
import {
  BubbleBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  BlockType,
} from 'models'
import React from 'react'

type BlockIconProps = { type: BlockType } & IconProps

export const BlockIcon = ({ type, ...props }: BlockIconProps) => {
  switch (type) {
    case BubbleBlockType.TEXT:
      return <ChatIcon color="blue.500" {...props} />
    case BubbleBlockType.IMAGE:
      return <ImageIcon color="blue.500" {...props} />
    case BubbleBlockType.VIDEO:
      return <FilmIcon color="blue.500" {...props} />
    case BubbleBlockType.EMBED:
      return <LayoutIcon color="blue.500" {...props} />
    case InputBlockType.TEXT:
      return <TextIcon color="orange.500" {...props} />
    case InputBlockType.NUMBER:
      return <NumberIcon color="orange.500" {...props} />
    case InputBlockType.EMAIL:
      return <EmailIcon color="orange.500" {...props} />
    case InputBlockType.URL:
      return <GlobeIcon color="orange.500" {...props} />
    case InputBlockType.DATE:
      return <CalendarIcon color="orange.500" {...props} />
    case InputBlockType.PHONE:
      return <PhoneIcon color="orange.500" {...props} />
    case InputBlockType.CHOICE:
      return <CheckSquareIcon color="orange.500" {...props} />
    case InputBlockType.PAYMENT:
      return <CreditCardIcon color="orange.500" {...props} />
    case InputBlockType.RATING:
      return <StarIcon color="orange.500" {...props} />
    case InputBlockType.FILE:
      return <UploadIcon color="orange.500" {...props} />
    case LogicBlockType.SET_VARIABLE:
      return <EditIcon color="purple.500" {...props} />
    case LogicBlockType.CONDITION:
      return <FilterIcon color="purple.500" {...props} />
    case LogicBlockType.REDIRECT:
      return <ExternalLinkIcon color="purple.500" {...props} />
    case LogicBlockType.CODE:
      return <CodeIcon color="purple.500" {...props} />
    case LogicBlockType.TYPEBOT_LINK:
      return <BoxIcon color="purple.500" {...props} />
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <GoogleSheetsLogo {...props} />
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <GoogleAnalyticsLogo {...props} />
    case IntegrationBlockType.WEBHOOK:
      return <WebhookIcon {...props} />
    case IntegrationBlockType.ZAPIER:
      return <ZapierLogo {...props} />
    case IntegrationBlockType.MAKE_COM:
      return <MakeComLogo {...props} />
    case IntegrationBlockType.PABBLY_CONNECT:
      return <PabblyConnectLogo {...props} />
    case IntegrationBlockType.EMAIL:
      return <SendEmailIcon {...props} />
    case IntegrationBlockType.CHATWOOT:
      return <ChatwootLogo {...props} />
    case 'start':
      return <FlagIcon {...props} />
  }
}
