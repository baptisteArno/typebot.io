import { useColorModeValue } from "@chakra-ui/react";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { cn } from "@typebot.io/ui/lib/cn";
import { FlagIcon, GalleryIcon, ThunderIcon } from "@/components/icons";
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
import { TimeInputIcon } from "@/features/blocks/inputs/time/components/TimeInputIcon";
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
import { ReturnBlockIcon } from "@/features/blocks/logic/return/components/ReturnBlockIcon";
import { ScriptIcon } from "@/features/blocks/logic/script/components/ScriptIcon";
import { SetVariableIcon } from "@/features/blocks/logic/setVariable/components/SetVariableIcon";
import { TypebotLinkIcon } from "@/features/blocks/logic/typebotLink/components/TypebotLinkIcon";
import { WaitIcon } from "@/features/blocks/logic/wait/components/WaitIcon";
import { WebhookIcon } from "@/features/blocks/logic/webhook/components/WebhookIcon";
import { ForgedBlockIcon } from "@/features/forge/ForgedBlockIcon";

type BlockIconProps = { type: Block["type"]; className?: string };

export const BlockIcon = ({ type, className }: BlockIconProps): JSX.Element => {
  const openAIColor = useColorModeValue("black", "white");

  switch (type) {
    case BubbleBlockType.TEXT:
      return (
        <TextBubbleIcon className={cn("text-gray-12 stroke-2", className)} />
      );
    case BubbleBlockType.IMAGE:
      return (
        <ImageBubbleIcon className={cn("text-gray-12 stroke-2", className)} />
      );
    case BubbleBlockType.VIDEO:
      return (
        <VideoBubbleIcon className={cn("text-gray-12 stroke-2", className)} />
      );
    case BubbleBlockType.EMBED:
      return (
        <EmbedBubbleIcon className={cn("text-gray-12 stroke-2", className)} />
      );
    case BubbleBlockType.AUDIO:
      return (
        <AudioBubbleIcon className={cn("text-gray-12 stroke-2", className)} />
      );
    case InputBlockType.TEXT:
      return (
        <TextInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.NUMBER:
      return (
        <NumberInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.EMAIL:
      return (
        <EmailInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.URL:
      return (
        <UrlInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.TIME:
      return (
        <TimeInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.DATE:
      return (
        <DateInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.PHONE:
      return (
        <PhoneInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.CHOICE:
      return (
        <ButtonsInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.PICTURE_CHOICE:
      return (
        <PictureChoiceIcon
          className={cn("text-orange-9 stroke-2", className)}
        />
      );
    case InputBlockType.PAYMENT:
      return (
        <PaymentInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.RATING:
      return (
        <RatingInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.FILE:
      return (
        <FileInputIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case InputBlockType.CARDS:
      return (
        <GalleryIcon className={cn("text-orange-9 stroke-2", className)} />
      );
    case LogicBlockType.SET_VARIABLE:
      return (
        <SetVariableIcon className={cn("text-purple-9 stroke-2", className)} />
      );
    case LogicBlockType.CONDITION:
      return (
        <ConditionIcon className={cn("text-purple-9 stroke-2", className)} />
      );
    case LogicBlockType.REDIRECT:
      return (
        <RedirectIcon className={cn("text-purple-9 stroke-2", className)} />
      );
    case LogicBlockType.SCRIPT:
      return <ScriptIcon className={cn("text-purple-9 stroke-2", className)} />;
    case LogicBlockType.WAIT:
      return <WaitIcon className={cn("text-purple-9 stroke-2", className)} />;
    case LogicBlockType.JUMP:
      return <JumpIcon className={cn("text-purple-9 stroke-2", className)} />;
    case LogicBlockType.TYPEBOT_LINK:
      return (
        <TypebotLinkIcon className={cn("text-purple-9 stroke-2", className)} />
      );
    case LogicBlockType.AB_TEST:
      return <AbTestIcon className={cn("text-purple-9 stroke-2", className)} />;
    case LogicBlockType.RETURN:
      return (
        <ReturnBlockIcon className={cn("text-purple-9 stroke-2", className)} />
      );
    case LogicBlockType.WEBHOOK:
      return <WebhookIcon className={className} />;
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <GoogleSheetsLogo className={className} />;
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <GoogleAnalyticsLogo className={className} />;
    case IntegrationBlockType.HTTP_REQUEST:
      return <ThunderIcon className={className} />;
    case IntegrationBlockType.ZAPIER:
      return <ZapierLogo className={className} />;
    case IntegrationBlockType.MAKE_COM:
      return <MakeComLogo className={className} />;
    case IntegrationBlockType.PABBLY_CONNECT:
      return <PabblyConnectLogo className={className} />;
    case IntegrationBlockType.EMAIL:
      return <SendEmailIcon className={className} />;
    case IntegrationBlockType.CHATWOOT:
      return <ChatwootLogo className={className} />;
    case IntegrationBlockType.PIXEL:
      return <PixelLogo className={className} />;
    case "start":
      return <FlagIcon className={className} />;
    case IntegrationBlockType.OPEN_AI:
      return <OpenAILogo className={className} fill={openAIColor} />;

    default:
      return <ForgedBlockIcon type={type} className={className} />;
  }
};
