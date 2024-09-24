import { FlagIcon, ThunderIcon } from "@/components/icons";
import { AudioBubbleIcon } from "@/features/blocks/bubbles/audio/components/AudioBubbleIcon";
import { EmbedBubbleIcon } from "@/features/blocks/bubbles/embed/components/EmbedBubbleIcon";
import { ImageBubbleIcon } from "@/features/blocks/bubbles/image/components/ImageBubbleIcon";
import { TextBubbleIcon } from "@/features/blocks/bubbles/textBubble/components/TextBubbleIcon";
import { VideoBubbleIcon } from "@/features/blocks/bubbles/video/components/VideoBubbleIcon";
import { ButtonsInputIcon } from "@/features/blocks/inputs/buttons/components/ButtonsIcon";
import { DateInputIcon } from "@/features/blocks/inputs/date/components/DateInputIcon";
import { EmailInputIcon } from "@/features/blocks/inputs/emailInput/components/EmailInputIcon";
import { FileInputIcon } from "@/features/blocks/inputs/fileUpload/components/FileInputIcon";
import { NumberInputIcon } from "@/features/blocks/inputs/number/components/NumberInputIcon";
import { PaymentInputIcon } from "@/features/blocks/inputs/payment/components/PaymentInputIcon";
import { PhoneInputIcon } from "@/features/blocks/inputs/phone/components/PhoneInputIcon";
import { PictureChoiceIcon } from "@/features/blocks/inputs/pictureChoice/components/PictureChoiceIcon";
import { RatingInputIcon } from "@/features/blocks/inputs/rating/components/RatingInputIcon";
import { TextInputIcon } from "@/features/blocks/inputs/textInput/components/TextInputIcon";
import { UrlInputIcon } from "@/features/blocks/inputs/url/components/UrlInputIcon";
import { ChatwootLogo } from "@/features/blocks/integrations/chatwoot/components/ChatwootLogo";
import { GoogleAnalyticsLogo } from "@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsLogo";
import { GoogleSheetsLogo } from "@/features/blocks/integrations/googleSheets/components/GoogleSheetsLogo";
import { MakeComLogo } from "@/features/blocks/integrations/makeCom/components/MakeComLogo";
import { OpenAILogo } from "@/features/blocks/integrations/openai/components/OpenAILogo";
import { PabblyConnectLogo } from "@/features/blocks/integrations/pabbly/components/PabblyConnectLogo";
import { PixelLogo } from "@/features/blocks/integrations/pixel/components/PixelLogo";
import { SendEmailIcon } from "@/features/blocks/integrations/sendEmail/components/SendEmailIcon";
import { ZapierLogo } from "@/features/blocks/integrations/zapier/components/ZapierLogo";
import { AbTestIcon } from "@/features/blocks/logic/abTest/components/AbTestIcon";
import { ConditionIcon } from "@/features/blocks/logic/condition/components/ConditionIcon";
import { JumpIcon } from "@/features/blocks/logic/jump/components/JumpIcon";
import { RedirectIcon } from "@/features/blocks/logic/redirect/components/RedirectIcon";
import { ScriptIcon } from "@/features/blocks/logic/script/components/ScriptIcon";
import { SetVariableIcon } from "@/features/blocks/logic/setVariable/components/SetVariableIcon";
import { TypebotLinkIcon } from "@/features/blocks/logic/typebotLink/components/TypebotLinkIcon";
import { WaitIcon } from "@/features/blocks/logic/wait/components/WaitIcon";
import { ForgedBlockIcon } from "@/features/forge/ForgedBlockIcon";
import { type IconProps, useColorModeValue } from "@chakra-ui/react";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import React from "react";

type BlockIconProps = { type: Block["type"] } & IconProps;

export const BlockIcon = ({ type, ...props }: BlockIconProps): JSX.Element => {
  const blue = useColorModeValue("blue.500", "blue.300");
  const orange = useColorModeValue("orange.500", "orange.300");
  const purple = useColorModeValue("purple.500", "purple.300");
  const openAIColor = useColorModeValue("black", "white");

  switch (type) {
    case BubbleBlockType.TEXT:
      return <TextBubbleIcon color={blue} {...props} />;
    case BubbleBlockType.IMAGE:
      return <ImageBubbleIcon color={blue} {...props} />;
    case BubbleBlockType.VIDEO:
      return <VideoBubbleIcon color={blue} {...props} />;
    case BubbleBlockType.EMBED:
      return <EmbedBubbleIcon color={blue} {...props} />;
    case BubbleBlockType.AUDIO:
      return <AudioBubbleIcon color={blue} {...props} />;
    case InputBlockType.TEXT:
      return <TextInputIcon color={orange} {...props} />;
    case InputBlockType.NUMBER:
      return <NumberInputIcon color={orange} {...props} />;
    case InputBlockType.EMAIL:
      return <EmailInputIcon color={orange} {...props} />;
    case InputBlockType.URL:
      return <UrlInputIcon color={orange} {...props} />;
    case InputBlockType.DATE:
      return <DateInputIcon color={orange} {...props} />;
    case InputBlockType.PHONE:
      return <PhoneInputIcon color={orange} {...props} />;
    case InputBlockType.CHOICE:
      return <ButtonsInputIcon color={orange} {...props} />;
    case InputBlockType.PICTURE_CHOICE:
      return <PictureChoiceIcon color={orange} {...props} />;
    case InputBlockType.PAYMENT:
      return <PaymentInputIcon color={orange} {...props} />;
    case InputBlockType.RATING:
      return <RatingInputIcon color={orange} {...props} />;
    case InputBlockType.FILE:
      return <FileInputIcon color={orange} {...props} />;
    case LogicBlockType.SET_VARIABLE:
      return <SetVariableIcon color={purple} {...props} />;
    case LogicBlockType.CONDITION:
      return <ConditionIcon color={purple} {...props} />;
    case LogicBlockType.REDIRECT:
      return <RedirectIcon color={purple} {...props} />;
    case LogicBlockType.SCRIPT:
      return <ScriptIcon {...props} />;
    case LogicBlockType.WAIT:
      return <WaitIcon color={purple} {...props} />;
    case LogicBlockType.JUMP:
      return <JumpIcon color={purple} {...props} />;
    case LogicBlockType.TYPEBOT_LINK:
      return <TypebotLinkIcon color={purple} {...props} />;
    case LogicBlockType.AB_TEST:
      return <AbTestIcon color={purple} {...props} />;
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <GoogleSheetsLogo {...props} />;
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <GoogleAnalyticsLogo {...props} />;
    case IntegrationBlockType.WEBHOOK:
      return <ThunderIcon {...props} />;
    case IntegrationBlockType.ZAPIER:
      return <ZapierLogo {...props} />;
    case IntegrationBlockType.MAKE_COM:
      return <MakeComLogo {...props} />;
    case IntegrationBlockType.PABBLY_CONNECT:
      return <PabblyConnectLogo {...props} />;
    case IntegrationBlockType.EMAIL:
      return <SendEmailIcon {...props} />;
    case IntegrationBlockType.CHATWOOT:
      return <ChatwootLogo {...props} />;
    case IntegrationBlockType.PIXEL:
      return <PixelLogo {...props} />;
    case "start":
      return <FlagIcon {...props} />;
    case IntegrationBlockType.OPEN_AI:
      return <OpenAILogo {...props} fill={openAIColor} />;
    default:
      return <ForgedBlockIcon type={type} {...props} />;
  }
};
