import { AudioBubbleNode } from "@/features/blocks/bubbles/audio/components/AudioBubbleNode";
import { EmbedBubbleContent } from "@/features/blocks/bubbles/embed/components/EmbedBubbleContent";
import { ImageBubbleContent } from "@/features/blocks/bubbles/image/components/ImageBubbleContent";
import { TextBubbleContent } from "@/features/blocks/bubbles/textBubble/components/TextBubbleContent";
import { VideoBubbleContent } from "@/features/blocks/bubbles/video/components/VideoBubbleContent";
import { ButtonsBlockNode } from "@/features/blocks/inputs/buttons/components/ButtonsBlockNode";
import { DateNodeContent } from "@/features/blocks/inputs/date/components/DateNodeContent";
import { EmailInputNodeContent } from "@/features/blocks/inputs/emailInput/components/EmailInputNodeContent";
import { FileInputContent } from "@/features/blocks/inputs/fileUpload/components/FileInputContent";
import { NumberNodeContent } from "@/features/blocks/inputs/number/components/NumberNodeContent";
import { PaymentInputContent } from "@/features/blocks/inputs/payment/components/PaymentInputContent";
import { PhoneNodeContent } from "@/features/blocks/inputs/phone/components/PhoneNodeContent";
import { PictureChoiceNode } from "@/features/blocks/inputs/pictureChoice/components/PictureChoiceNode";
import { RatingInputContent } from "@/features/blocks/inputs/rating/components/RatingInputContent";
import { TextInputNodeContent } from "@/features/blocks/inputs/textInput/components/TextInputNodeContent";
import { UrlNodeContent } from "@/features/blocks/inputs/url/components/UrlNodeContent";
import { ChatwootNodeBody } from "@/features/blocks/integrations/chatwoot/components/ChatwootNodeBody";
import { GoogleAnalyticsNodeBody } from "@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsNodeBody";
import { GoogleSheetsNodeContent } from "@/features/blocks/integrations/googleSheets/components/GoogleSheetsNodeContent";
import { MakeComContent } from "@/features/blocks/integrations/makeCom/components/MakeComContent";
import { OpenAINodeBody } from "@/features/blocks/integrations/openai/components/OpenAINodeBody";
import { PabblyConnectContent } from "@/features/blocks/integrations/pabbly/components/PabblyConnectContent";
import { PixelNodeBody } from "@/features/blocks/integrations/pixel/components/PixelNodeBody";
import { SendEmailContent } from "@/features/blocks/integrations/sendEmail/components/SendEmailContent";
import { WebhookContent } from "@/features/blocks/integrations/webhook/components/HttpRequestContent";
import { ZapierContent } from "@/features/blocks/integrations/zapier/components/ZapierContent";
import { AbTestNodeBody } from "@/features/blocks/logic/abTest/components/AbTestNodeBody";
import { JumpNodeBody } from "@/features/blocks/logic/jump/components/JumpNodeBody";
import { RedirectNodeContent } from "@/features/blocks/logic/redirect/components/RedirectNodeContent";
import { ScriptNodeContent } from "@/features/blocks/logic/script/components/ScriptNodeContent";
import { SetVariableContent } from "@/features/blocks/logic/setVariable/components/SetVariableContent";
import { TypebotLinkNode } from "@/features/blocks/logic/typebotLink/components/TypebotLinkNode";
import { WaitNodeContent } from "@/features/blocks/logic/wait/components/WaitNodeContent";
import { ForgedBlockNodeContent } from "@/features/forge/components/ForgedBlockNodeContent";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type {
  BlockIndices,
  BlockV6,
} from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { ItemNodesList } from "../item/ItemNodesList";

type Props = {
  block: BlockV6;
  groupId: string;
  indices: BlockIndices;
};
export const BlockNodeContent = ({
  block,
  indices,
  groupId,
}: Props): JSX.Element => {
  switch (block.type) {
    case BubbleBlockType.TEXT: {
      return <TextBubbleContent block={block} />;
    }
    case BubbleBlockType.IMAGE: {
      return <ImageBubbleContent block={block} />;
    }
    case BubbleBlockType.VIDEO: {
      return <VideoBubbleContent block={block} />;
    }
    case BubbleBlockType.EMBED: {
      return <EmbedBubbleContent block={block} />;
    }
    case BubbleBlockType.AUDIO: {
      return <AudioBubbleNode url={block.content?.url} />;
    }
    case InputBlockType.TEXT: {
      return <TextInputNodeContent options={block.options} />;
    }
    case InputBlockType.NUMBER: {
      return <NumberNodeContent options={block.options} />;
    }
    case InputBlockType.EMAIL: {
      return <EmailInputNodeContent options={block.options} />;
    }
    case InputBlockType.URL: {
      return <UrlNodeContent options={block.options} />;
    }
    case InputBlockType.CHOICE: {
      return <ButtonsBlockNode block={block} indices={indices} />;
    }
    case InputBlockType.PICTURE_CHOICE: {
      return <PictureChoiceNode block={block} indices={indices} />;
    }
    case InputBlockType.PHONE: {
      return <PhoneNodeContent options={block.options} />;
    }
    case InputBlockType.DATE: {
      return <DateNodeContent variableId={block.options?.variableId} />;
    }
    case InputBlockType.PAYMENT: {
      return <PaymentInputContent block={block} />;
    }
    case InputBlockType.RATING: {
      return <RatingInputContent block={block} />;
    }
    case InputBlockType.FILE: {
      return <FileInputContent options={block.options} />;
    }
    case LogicBlockType.SET_VARIABLE: {
      return <SetVariableContent block={block} />;
    }
    case LogicBlockType.REDIRECT: {
      return <RedirectNodeContent url={block.options?.url} />;
    }
    case LogicBlockType.SCRIPT: {
      return <ScriptNodeContent options={block.options} />;
    }
    case LogicBlockType.WAIT: {
      return <WaitNodeContent options={block.options} />;
    }
    case LogicBlockType.JUMP: {
      return <JumpNodeBody options={block.options} />;
    }
    case LogicBlockType.AB_TEST: {
      return <AbTestNodeBody block={block} groupId={groupId} />;
    }
    case LogicBlockType.TYPEBOT_LINK:
      return <TypebotLinkNode block={block} />;
    case LogicBlockType.CONDITION:
      return <ItemNodesList block={block} indices={indices} />;
    case IntegrationBlockType.GOOGLE_SHEETS: {
      return <GoogleSheetsNodeContent options={block.options} />;
    }
    case IntegrationBlockType.GOOGLE_ANALYTICS: {
      return <GoogleAnalyticsNodeBody action={block.options?.action} />;
    }
    case IntegrationBlockType.WEBHOOK: {
      return <WebhookContent block={block} />;
    }
    case IntegrationBlockType.ZAPIER: {
      return <ZapierContent block={block} />;
    }
    case IntegrationBlockType.PABBLY_CONNECT: {
      return <PabblyConnectContent block={block} />;
    }
    case IntegrationBlockType.MAKE_COM: {
      return <MakeComContent block={block} />;
    }
    case IntegrationBlockType.EMAIL: {
      return <SendEmailContent block={block} />;
    }
    case IntegrationBlockType.CHATWOOT: {
      return <ChatwootNodeBody block={block} />;
    }
    case IntegrationBlockType.OPEN_AI: {
      return <OpenAINodeBody options={block.options} />;
    }
    case IntegrationBlockType.PIXEL: {
      return <PixelNodeBody options={block.options} />;
    }
    default: {
      return <ForgedBlockNodeContent block={block} indices={indices} />;
    }
  }
};
