import { ButtonsBlockSettings } from "@/features/blocks/inputs/buttons/components/ButtonsBlockSettings";
import { CardsBlockSettings } from "@/features/blocks/inputs/cards/components/CardsBlockSettings";
import { DateInputSettings } from "@/features/blocks/inputs/date/components/DateInputSettings";
import { EmailInputSettings } from "@/features/blocks/inputs/emailInput/components/EmailInputSettings";
import { FileInputSettings } from "@/features/blocks/inputs/fileUpload/components/FileInputSettings";
import { NumberInputSettings } from "@/features/blocks/inputs/number/components/NumberInputSettings";
import { PaymentSettings } from "@/features/blocks/inputs/payment/components/PaymentSettings";
import { PhoneInputSettings } from "@/features/blocks/inputs/phone/components/PhoneInputSettings";
import { PictureChoiceSettings } from "@/features/blocks/inputs/pictureChoice/components/PictureChoiceSettings";
import { RatingInputSettings } from "@/features/blocks/inputs/rating/components/RatingInputSettings";
import { TextInputSettings } from "@/features/blocks/inputs/textInput/components/TextInputSettings";
import { TimeInputSettings } from "@/features/blocks/inputs/time/components/TimeInputSettings";
import { UrlInputSettings } from "@/features/blocks/inputs/url/components/UrlInputSettings";
import { ChatwootSettings } from "@/features/blocks/integrations/chatwoot/components/ChatwootSettings";
import { GoogleAnalyticsSettings } from "@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsSettings";
import { GoogleSheetsSettings } from "@/features/blocks/integrations/googleSheets/components/GoogleSheetsSettings";
import { HttpRequestSettings } from "@/features/blocks/integrations/httpRequest/components/HttpRequestSettings";
import { MakeComSettings } from "@/features/blocks/integrations/makeCom/components/MakeComSettings";
import { OpenAISettings } from "@/features/blocks/integrations/openai/components/OpenAISettings";
import { PabblyConnectSettings } from "@/features/blocks/integrations/pabbly/components/PabblyConnectSettings";
import { PixelSettings } from "@/features/blocks/integrations/pixel/components/PixelSettings";
import { SendEmailSettings } from "@/features/blocks/integrations/sendEmail/components/SendEmailSettings";
import { ZapierSettings } from "@/features/blocks/integrations/zapier/components/ZapierSettings";
import { AbTestSettings } from "@/features/blocks/logic/abTest/components/AbTestSettings";
import { JumpSettings } from "@/features/blocks/logic/jump/components/JumpSettings";
import { RedirectSettings } from "@/features/blocks/logic/redirect/components/RedirectSettings";
import { ScriptSettings } from "@/features/blocks/logic/script/components/ScriptSettings";
import { SetVariableSettings } from "@/features/blocks/logic/setVariable/components/SetVariableSettings";
import { TypebotLinkForm } from "@/features/blocks/logic/typebotLink/components/TypebotLinkForm";
import { WaitSettings } from "@/features/blocks/logic/wait/components/WaitSettings";
import { WebhookSettings } from "@/features/blocks/logic/webhook/components/WebhookSettings";
import { CommandEventSettings } from "@/features/events/components/CommandEventSettings";
import { useForgedBlock } from "@/features/forge/hooks/useForgedBlock";
import { VideoOnboardingPopover } from "@/features/onboarding/components/VideoOnboardingPopover";
import { hasOnboardingVideo } from "@/features/onboarding/helpers/hasOnboardingVideo";
import {
  Flex,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  SlideFade,
  Stack,
  useColorModeValue,
  useEventListener,
} from "@chakra-ui/react";
import type {
  BlockOptions,
  BlockWithOptions,
} from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { EventType } from "@typebot.io/events/constants";
import type { TEventWithOptions } from "@typebot.io/events/schemas";
import { useRef, useState } from "react";
import { ForgedBlockSettings } from "../../../../forge/components/ForgedBlockSettings";
import { SettingsHoverBar } from "./SettingsHoverBar";

type Props = {
  node: BlockWithOptions | TEventWithOptions;
  groupId: string | undefined;
  onExpandClick: () => void;
  onNodeChange: (
    updates: Partial<BlockWithOptions | TEventWithOptions>,
  ) => void;
};

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const [isHovering, setIsHovering] = useState(false);
  const arrowColor = useColorModeValue("white", "gray.900");
  const { blockDef } = useForgedBlock({
    nodeType: props.node.type,
  });
  const ref = useRef<HTMLDivElement | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation();

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
  };
  useEventListener("wheel", handleMouseWheel, ref.current);

  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown} pos="relative">
        <PopoverArrow bgColor={arrowColor} />

        <VideoOnboardingPopover.Root type={props.node.type} blockDef={blockDef}>
          {({ onOpen }) => (
            <PopoverBody
              py="3"
              overflowY="auto"
              maxH="400px"
              ref={ref}
              shadow="md"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Stack spacing={3}>
                <Flex
                  w="full"
                  pos="absolute"
                  top="-56px"
                  height="64px"
                  right={0}
                  justifyContent="flex-end"
                  align="center"
                >
                  <SlideFade in={isHovering} unmountOnExit>
                    <SettingsHoverBar
                      onExpandClick={onExpandClick}
                      onVideoOnboardingClick={onOpen}
                      nodeType={props.node.type}
                      blockDef={blockDef}
                      isVideoOnboardingItemDisplayed={hasOnboardingVideo({
                        nodeType: props.node.type,
                        blockDef,
                      })}
                    />
                  </SlideFade>
                </Flex>
                <NodeSettings {...props} />
              </Stack>
            </PopoverBody>
          )}
        </VideoOnboardingPopover.Root>
      </PopoverContent>
    </Portal>
  );
};

export const NodeSettings = ({
  node,
  groupId,
  onNodeChange,
}: {
  node: BlockWithOptions | TEventWithOptions;
  groupId: string | undefined;
  onNodeChange: (node: Partial<BlockWithOptions | TEventWithOptions>) => void;
}): JSX.Element | null => {
  const updateOptions = (
    options: BlockOptions | TEventWithOptions["options"],
  ) => {
    onNodeChange({ options });
  };

  switch (node.type) {
    case InputBlockType.TEXT: {
      return (
        <TextInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.NUMBER: {
      return (
        <NumberInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.EMAIL: {
      return (
        <EmailInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.URL: {
      return (
        <UrlInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.DATE: {
      return (
        <DateInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.TIME: {
      return (
        <TimeInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.PHONE: {
      return (
        <PhoneInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.CHOICE: {
      return (
        <ButtonsBlockSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.PICTURE_CHOICE: {
      return (
        <PictureChoiceSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.PAYMENT: {
      return (
        <PaymentSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.RATING: {
      return (
        <RatingInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.FILE: {
      return (
        <FileInputSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case InputBlockType.CARDS: {
      return (
        <CardsBlockSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case LogicBlockType.SET_VARIABLE: {
      return (
        <SetVariableSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case LogicBlockType.REDIRECT: {
      return (
        <RedirectSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case LogicBlockType.SCRIPT: {
      return (
        <ScriptSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case LogicBlockType.TYPEBOT_LINK: {
      return (
        <TypebotLinkForm
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case LogicBlockType.WAIT: {
      return (
        <WaitSettings options={node.options} onOptionsChange={updateOptions} />
      );
    }
    case LogicBlockType.JUMP: {
      return groupId ? (
        <JumpSettings
          groupId={groupId}
          options={node.options}
          onOptionsChange={updateOptions}
        />
      ) : (
        <></>
      );
    }
    case LogicBlockType.AB_TEST: {
      return (
        <AbTestSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case IntegrationBlockType.GOOGLE_SHEETS: {
      return (
        <GoogleSheetsSettings
          options={node.options}
          onOptionsChange={updateOptions}
          blockId={node.id}
        />
      );
    }
    case IntegrationBlockType.GOOGLE_ANALYTICS: {
      return (
        <GoogleAnalyticsSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case IntegrationBlockType.ZAPIER: {
      return <ZapierSettings block={node} onOptionsChange={updateOptions} />;
    }
    case IntegrationBlockType.MAKE_COM: {
      return <MakeComSettings block={node} onOptionsChange={updateOptions} />;
    }
    case IntegrationBlockType.PABBLY_CONNECT: {
      return (
        <PabblyConnectSettings block={node} onOptionsChange={updateOptions} />
      );
    }
    case IntegrationBlockType.HTTP_REQUEST: {
      return (
        <HttpRequestSettings block={node} onOptionsChange={updateOptions} />
      );
    }
    case IntegrationBlockType.EMAIL: {
      return (
        <SendEmailSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case IntegrationBlockType.CHATWOOT: {
      return (
        <ChatwootSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    }
    case IntegrationBlockType.OPEN_AI: {
      return <OpenAISettings block={node} onOptionsChange={updateOptions} />;
    }
    case IntegrationBlockType.PIXEL: {
      return (
        <PixelSettings options={node.options} onOptionsChange={updateOptions} />
      );
    }
    case LogicBlockType.CONDITION:
      return null;
    case LogicBlockType.WEBHOOK:
      return (
        <WebhookSettings
          blockId={node.id}
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    case EventType.COMMAND:
      return (
        <CommandEventSettings
          options={node.options}
          onOptionsChange={updateOptions}
        />
      );
    default: {
      return (
        <ForgedBlockSettings block={node} onOptionsChange={updateOptions} />
      );
    }
  }
};
