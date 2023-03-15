import { IconProps, useColorModeValue } from '@chakra-ui/react'
import {
  BubbleBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  BlockType,
} from '@typebot.io/schemas'
import React from 'react'
import { TextBubbleIcon } from '@/features/blocks/bubbles/textBubble'
import { ImageBubbleIcon } from '@/features/blocks/bubbles/image'
import { VideoBubbleIcon } from '@/features/blocks/bubbles/video'
import { ChatwootLogo } from '@/features/blocks/integrations/chatwoot'
import { FlagIcon } from '@/components/icons'
import { SendEmailIcon } from '@/features/blocks/integrations/sendEmail'
import { PabblyConnectLogo } from '@/features/blocks/integrations/pabbly'
import { MakeComLogo } from '@/features/blocks/integrations/makeCom'
import { ZapierLogo } from '@/features/blocks/integrations/zapier'
import { WebhookIcon } from '@/features/blocks/integrations/webhook'
import { GoogleSheetsLogo } from '@/features/blocks/integrations/googleSheets'
import { TypebotLinkIcon } from '@/features/blocks/logic/typebotLink'
import { RedirectIcon } from '@/features/blocks/logic/redirect'
import { ConditionIcon } from '@/features/blocks/logic/condition'
import { SetVariableIcon } from '@/features/blocks/logic/setVariable'
import { FileInputIcon } from '@/features/blocks/inputs/fileUpload'
import { RatingInputIcon } from '@/features/blocks/inputs/rating'
import { PaymentInputIcon } from '@/features/blocks/inputs/payment'
import { ButtonsInputIcon } from '@/features/blocks/inputs/buttons'
import { PhoneInputIcon } from '@/features/blocks/inputs/phone'
import { DateInputIcon } from '@/features/blocks/inputs/date'
import { UrlInputIcon } from '@/features/blocks/inputs/url'
import { EmailInputIcon } from '@/features/blocks/inputs/emailInput'
import { NumberInputIcon } from '@/features/blocks/inputs/number'
import { TextInputIcon } from '@/features/blocks/inputs/textInput'
import { EmbedBubbleIcon } from '@/features/blocks/bubbles/embed'
import { GoogleAnalyticsLogo } from '@/features/blocks/integrations/googleAnalytics'
import { AudioBubbleIcon } from '@/features/blocks/bubbles/audio'
import { WaitIcon } from '@/features/blocks/logic/wait/components/WaitIcon'
import { ScriptIcon } from '@/features/blocks/logic/script/components/ScriptIcon'
import { JumpIcon } from '@/features/blocks/logic/jump/components/JumpIcon'
import { OpenAILogo } from '@/features/blocks/integrations/openai/components/OpenAILogo'

type BlockIconProps = { type: BlockType } & IconProps

export const BlockIcon = ({ type, ...props }: BlockIconProps): JSX.Element => {
  const blue = useColorModeValue('blue.500', 'blue.300')
  const orange = useColorModeValue('orange.500', 'orange.300')
  const purple = useColorModeValue('purple.500', 'purple.300')
  switch (type) {
    case BubbleBlockType.TEXT:
      return <TextBubbleIcon color={blue} {...props} />
    case BubbleBlockType.IMAGE:
      return <ImageBubbleIcon color={blue} {...props} />
    case BubbleBlockType.VIDEO:
      return <VideoBubbleIcon color={blue} {...props} />
    case BubbleBlockType.EMBED:
      return <EmbedBubbleIcon color={blue} {...props} />
    case BubbleBlockType.AUDIO:
      return <AudioBubbleIcon color={blue} {...props} />
    case InputBlockType.TEXT:
      return <TextInputIcon color={orange} {...props} />
    case InputBlockType.NUMBER:
      return <NumberInputIcon color={orange} {...props} />
    case InputBlockType.EMAIL:
      return <EmailInputIcon color={orange} {...props} />
    case InputBlockType.URL:
      return <UrlInputIcon color={orange} {...props} />
    case InputBlockType.DATE:
      return <DateInputIcon color={orange} {...props} />
    case InputBlockType.PHONE:
      return <PhoneInputIcon color={orange} {...props} />
    case InputBlockType.CHOICE:
      return <ButtonsInputIcon color={orange} {...props} />
    case InputBlockType.PAYMENT:
      return <PaymentInputIcon color={orange} {...props} />
    case InputBlockType.RATING:
      return <RatingInputIcon color={orange} {...props} />
    case InputBlockType.FILE:
      return <FileInputIcon color={orange} {...props} />
    case LogicBlockType.SET_VARIABLE:
      return <SetVariableIcon color={purple} {...props} />
    case LogicBlockType.CONDITION:
      return <ConditionIcon color={purple} {...props} />
    case LogicBlockType.REDIRECT:
      return <RedirectIcon color={purple} {...props} />
    case LogicBlockType.SCRIPT:
      return <ScriptIcon {...props} />
    case LogicBlockType.WAIT:
      return <WaitIcon color={purple} {...props} />
    case LogicBlockType.JUMP:
      return <JumpIcon color={purple} {...props} />
    case LogicBlockType.TYPEBOT_LINK:
      return <TypebotLinkIcon color={purple} {...props} />
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
    case IntegrationBlockType.OPEN_AI:
      return <OpenAILogo {...props} />
    case 'start':
      return <FlagIcon {...props} />
  }
}
