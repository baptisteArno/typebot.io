import { useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { FlagIcon, SendEmailIcon, WebhookIcon } from '@/components/icons'
import { WaitIcon } from '@/features/blocks/logic/wait/components/WaitIcon'
import { ScriptIcon } from '@/features/blocks/logic/script/components/ScriptIcon'
import { JumpIcon } from '@/features/blocks/logic/jump/components/JumpIcon'
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
import { ZemanticAiLogo } from '@/features/blocks/integrations/zemanticAi/ZemanticAiLogo'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { Block } from '@typebot.io/schemas'
import { OpenAILogo } from '@/features/blocks/integrations/openai/components/OpenAILogo'
import { ForgedBlockIcon } from '@/features/forge/ForgedBlockIcon'

type BlockIconProps = { type: Block['type']; mt?: string }

export const BlockIcon = ({ type, mt }: BlockIconProps): JSX.Element => {
  const blue = useColorModeValue('blue.500', 'blue.300')
  const orange = useColorModeValue('orange.500', 'orange.300')
  const purple = useColorModeValue('purple.500', 'purple.300')
  const openAIColor = useColorModeValue('black', 'white')

  switch (type) {
    case BubbleBlockType.TEXT:
      return <TextBubbleIcon color={blue} mt={mt} />
    case BubbleBlockType.IMAGE:
      return <ImageBubbleIcon color={blue} mt={mt} />
    case BubbleBlockType.VIDEO:
      return <VideoBubbleIcon color={blue} mt={mt} />
    case BubbleBlockType.EMBED:
      return <EmbedBubbleIcon color={blue} mt={mt} />
    case BubbleBlockType.AUDIO:
      return <AudioBubbleIcon color={blue} mt={mt} />
    case InputBlockType.TEXT:
      return <TextInputIcon color={orange} mt={mt} />
    case InputBlockType.NUMBER:
      return <NumberInputIcon color={orange} mt={mt} />
    case InputBlockType.EMAIL:
      return <EmailInputIcon color={orange} mt={mt} />
    case InputBlockType.URL:
      return <UrlInputIcon color={orange} mt={mt} />
    case InputBlockType.DATE:
      return <DateInputIcon color={orange} mt={mt} />
    case InputBlockType.PHONE:
      return <PhoneInputIcon color={orange} mt={mt} />
    case InputBlockType.CHOICE:
      return <ButtonsInputIcon color={orange} mt={mt} />
    case InputBlockType.PICTURE_CHOICE:
      return <PictureChoiceIcon color={orange} mt={mt} />
    case InputBlockType.PAYMENT:
      return <PaymentInputIcon color={orange} mt={mt} />
    case InputBlockType.RATING:
      return <RatingInputIcon color={orange} mt={mt} />
    case InputBlockType.FILE:
      return <FileInputIcon color={orange} mt={mt} />
    case LogicBlockType.SET_VARIABLE:
      return <SetVariableIcon color={purple} mt={mt} />
    case LogicBlockType.CONDITION:
      return <ConditionIcon color={purple} mt={mt} />
    case LogicBlockType.REDIRECT:
      return <RedirectIcon color={purple} mt={mt} />
    case LogicBlockType.SCRIPT:
      return <ScriptIcon mt={mt} />
    case LogicBlockType.WAIT:
      return <WaitIcon color={purple} mt={mt} />
    case LogicBlockType.JUMP:
      return <JumpIcon color={purple} mt={mt} />
    case LogicBlockType.TYPEBOT_LINK:
      return <TypebotLinkIcon color={purple} mt={mt} />
    case LogicBlockType.AB_TEST:
      return <AbTestIcon color={purple} mt={mt} />
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <GoogleSheetsLogo mt={mt} />
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <GoogleAnalyticsLogo mt={mt} />
    case IntegrationBlockType.WEBHOOK:
      return <WebhookIcon mt={mt} />
    case IntegrationBlockType.ZAPIER:
      return <ZapierLogo mt={mt} />
    case IntegrationBlockType.MAKE_COM:
      return <MakeComLogo mt={mt} />
    case IntegrationBlockType.PABBLY_CONNECT:
      return <PabblyConnectLogo mt={mt} />
    case IntegrationBlockType.EMAIL:
      return <SendEmailIcon mt={mt} />
    case IntegrationBlockType.CHATWOOT:
      return <ChatwootLogo mt={mt} />
    case IntegrationBlockType.PIXEL:
      return <PixelLogo mt={mt} />
    case IntegrationBlockType.ZEMANTIC_AI:
      return <ZemanticAiLogo mt={mt} />
    case 'start':
      return <FlagIcon mt={mt} />
    case IntegrationBlockType.OPEN_AI:
      return <OpenAILogo mt={mt} fill={openAIColor} />
    default:
      return <ForgedBlockIcon type={type} mt={mt} />
  }
}
