import { IconProps, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { WaitIcon } from '@/features/blocks/logic/wait/components/WaitIcon'
import { ScriptIcon } from '@/features/blocks/logic/script/components/ScriptIcon'
import { JumpIcon } from '@/features/blocks/logic/jump/components/JumpIcon'
import { CloseChatIcon } from '@/features/blocks/logic/closeChat/components/CloseChatIcon'
import { AssignChatIcon } from '@/features/blocks/logic/assignChat/components/AssignChatIcon'
import { AudioBubbleIcon } from '@/features/blocks/bubbles/audio/components/AudioBubbleIcon'
import { EmbedBubbleIcon } from '@/features/blocks/bubbles/embed/components/EmbedBubbleIcon'
import { ImageBubbleIcon } from '@/features/blocks/bubbles/image/components/ImageBubbleIcon'
import { TextBubbleIcon } from '@/features/blocks/bubbles/textBubble/components/TextBubbleIcon'
import { VideoBubbleIcon } from '@/features/blocks/bubbles/video/components/VideoBubbleIcon'
import { ButtonsInputIcon } from '@/features/blocks/inputs/buttons/components/ButtonsIcon'
import { DateInputIcon } from '@/features/blocks/inputs/date/components/DateInputIcon'
import { EmailInputIcon } from '@/features/blocks/inputs/emailInput/components/EmailInputIcon'
import { FileInputIcon } from '@/features/blocks/inputs/fileUpload/components/FileInputIcon'
import { NumberInputIcon } from '@/features/blocks/inputs/number/components/NumberInputIcon'
import { PaymentInputIcon } from '@/features/blocks/inputs/payment/components/PaymentInputIcon'
import { PhoneInputIcon } from '@/features/blocks/inputs/phone/components/PhoneInputIcon'
import { RatingInputIcon } from '@/features/blocks/inputs/rating/components/RatingInputIcon'
import { TextInputIcon } from '@/features/blocks/inputs/textInput/components/TextInputIcon'
import { UrlInputIcon } from '@/features/blocks/inputs/url/components/UrlInputIcon'
import { ChatwootLogo } from '@/features/blocks/integrations/chatwoot/components/ChatwootLogo'
import { GoogleAnalyticsLogo } from '@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsLogo'
import { GoogleSheetsLogo } from '@/features/blocks/integrations/googleSheets/components/GoogleSheetsLogo'
import { MakeComLogo } from '@/features/blocks/integrations/makeCom/components/MakeComLogo'
import { PabblyConnectLogo } from '@/features/blocks/integrations/pabbly/components/PabblyConnectLogo'
import { ZapierLogo } from '@/features/blocks/integrations/zapier/components/ZapierLogo'
import { ConditionIcon } from '@/features/blocks/logic/condition/components/ConditionIcon'
import { RedirectIcon } from '@/features/blocks/logic/redirect/components/RedirectIcon'
import { SetVariableIcon } from '@/features/blocks/logic/setVariable/components/SetVariableIcon'
import { TypebotLinkIcon } from '@/features/blocks/logic/typebotLink/components/TypebotLinkIcon'
import { AbTestIcon } from '@/features/blocks/logic/abTest/components/AbTestIcon'
import { PictureChoiceIcon } from '@/features/blocks/inputs/pictureChoice/components/PictureChoiceIcon'
import { PixelLogo } from '@/features/blocks/integrations/pixel/components/PixelLogo'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { Block } from '@typebot.io/schemas'
import { OpenAILogo } from '@/features/blocks/integrations/openai/components/OpenAILogo'
import { ForgedBlockIcon } from '@/features/forge/ForgedBlockIcon'
import { SendEmailIcon } from '@/features/blocks/integrations/sendEmail/components/SendEmailIcon'
import { FlagIcon, ThunderIcon } from '@/components/icons'
import { GlobalJumpIcon } from '../../blocks/logic/globalJump/components/GlobalJumpIcon'

type BlockIconProps = { type: Block['type'] } & IconProps

export const BlockIcon = ({ type, ...props }: BlockIconProps): JSX.Element => {
  const orange = useColorModeValue('orange.500', 'orange.300')
  const purple = useColorModeValue('purple.500', 'purple.300')
  const openAIColor = useColorModeValue('black', 'white')

  switch (type) {
    case BubbleBlockType.TEXT:
      return <TextBubbleIcon color={orange} {...props} />
    case BubbleBlockType.IMAGE:
      return <ImageBubbleIcon color={orange} {...props} />
    case BubbleBlockType.VIDEO:
      return <VideoBubbleIcon color={orange} {...props} />
    case BubbleBlockType.EMBED:
      return <EmbedBubbleIcon color={orange} {...props} />
    case BubbleBlockType.AUDIO:
      return <AudioBubbleIcon color={orange} {...props} />
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
    case InputBlockType.PICTURE_CHOICE:
      return <PictureChoiceIcon color={orange} {...props} />
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
    case LogicBlockType.CLOSE_CHAT:
      return <CloseChatIcon color={purple} {...props} />
    case LogicBlockType.ASSIGN_CHAT:
      return <AssignChatIcon color={purple} {...props} />
    case LogicBlockType.TYPEBOT_LINK:
      return <TypebotLinkIcon color={purple} {...props} />
    case LogicBlockType.AB_TEST:
      return <AbTestIcon color={purple} {...props} />
    case LogicBlockType.GLOBAL_JUMP:
      return <GlobalJumpIcon color={purple} {...props} />
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <GoogleSheetsLogo {...props} />
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <GoogleAnalyticsLogo {...props} />
    case IntegrationBlockType.WEBHOOK:
      return <ThunderIcon {...props} />
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
    case IntegrationBlockType.PIXEL:
      return <PixelLogo {...props} />
    case 'start':
      return <FlagIcon {...props} />
    case IntegrationBlockType.OPEN_AI:
      return <OpenAILogo {...props} fill={openAIColor} />
    default:
      return <ForgedBlockIcon type={type} {...props} />
  }
}
