import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
  Stack,
  useColorModeValue,
  SlideFade,
  Flex,
} from '@chakra-ui/react'
import { Block, BlockOptions, BlockWithOptions } from '@typebot.io/schemas'
import { useRef, useState } from 'react'
import { WaitSettings } from '@/features/blocks/logic/wait/components/WaitSettings'
import { ScriptSettings } from '@/features/blocks/logic/script/components/ScriptSettings'
import { JumpSettings } from '@/features/blocks/logic/jump/components/JumpSettings'
import { MakeComSettings } from '@/features/blocks/integrations/makeCom/components/MakeComSettings'
import { PabblyConnectSettings } from '@/features/blocks/integrations/pabbly/components/PabblyConnectSettings'
import { ButtonsBlockSettings } from '@/features/blocks/inputs/buttons/components/ButtonsBlockSettings'
import { FileInputSettings } from '@/features/blocks/inputs/fileUpload/components/FileInputSettings'
import { PaymentSettings } from '@/features/blocks/inputs/payment/components/PaymentSettings'
import { RatingInputSettings } from '@/features/blocks/inputs/rating/components/RatingInputSettings'
import { TextInputSettings } from '@/features/blocks/inputs/textInput/components/TextInputSettings'
import { GoogleAnalyticsSettings } from '@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsSettings'
import { SendEmailSettings } from '@/features/blocks/integrations/sendEmail/components/SendEmailSettings'
import { HttpRequestSettings } from '@/features/blocks/integrations/webhook/components/HttpRequestSettings'
import { ZapierSettings } from '@/features/blocks/integrations/zapier/components/ZapierSettings'
import { RedirectSettings } from '@/features/blocks/logic/redirect/components/RedirectSettings'
import { SetVariableSettings } from '@/features/blocks/logic/setVariable/components/SetVariableSettings'
import { TypebotLinkForm } from '@/features/blocks/logic/typebotLink/components/TypebotLinkForm'
import { NumberInputSettings } from '@/features/blocks/inputs/number/components/NumberInputSettings'
import { EmailInputSettings } from '@/features/blocks/inputs/emailInput/components/EmailInputSettings'
import { UrlInputSettings } from '@/features/blocks/inputs/url/components/UrlInputSettings'
import { DateInputSettings } from '@/features/blocks/inputs/date/components/DateInputSettings'
import { PhoneInputSettings } from '@/features/blocks/inputs/phone/components/PhoneInputSettings'
import { GoogleSheetsSettings } from '@/features/blocks/integrations/googleSheets/components/GoogleSheetsSettings'
import { ChatwootSettings } from '@/features/blocks/integrations/chatwoot/components/ChatwootSettings'
import { AbTestSettings } from '@/features/blocks/logic/abTest/components/AbTestSettings'
import { PictureChoiceSettings } from '@/features/blocks/inputs/pictureChoice/components/PictureChoiceSettings'
import { SettingsHoverBar } from './SettingsHoverBar'
import { PixelSettings } from '@/features/blocks/integrations/pixel/components/PixelSettings'
import { ZemanticAiSettings } from '@/features/blocks/integrations/zemanticAi/ZemanticAiSettings'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { ForgedBlockSettings } from '../../../../forge/components/ForgedBlockSettings'
import { OpenAISettings } from '@/features/blocks/integrations/openai/components/OpenAISettings'
import { useForgedBlock } from '@/features/forge/hooks/useForgedBlock'
import { VideoOnboardingPopover } from '@/features/onboarding/components/VideoOnboardingPopover'
import { hasOnboardingVideo } from '@/features/onboarding/helpers/hasOnboardingVideo'

type Props = {
  block: BlockWithOptions
  groupId: string | undefined
  onExpandClick: () => void
  onBlockChange: (updates: Partial<Block>) => void
}

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const [isHovering, setIsHovering] = useState(false)
  const arrowColor = useColorModeValue('white', 'gray.800')
  const { blockDef } = useForgedBlock(props.block.type)
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)

  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown} pos="relative">
        <PopoverArrow bgColor={arrowColor} />

        <VideoOnboardingPopover.Root
          type={props.block.type}
          blockDef={blockDef}
        >
          {({ onToggle }) => (
            <PopoverBody
              py="3"
              overflowY="auto"
              maxH="400px"
              ref={ref}
              shadow="lg"
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
                      onVideoOnboardingClick={onToggle}
                      blockType={props.block.type}
                      blockDef={blockDef}
                      isVideoOnboardingItemDisplayed={hasOnboardingVideo({
                        blockType: props.block.type,
                        blockDef,
                      })}
                    />
                  </SlideFade>
                </Flex>
                <BlockSettings {...props} />
              </Stack>
            </PopoverBody>
          )}
        </VideoOnboardingPopover.Root>
      </PopoverContent>
    </Portal>
  )
}

export const BlockSettings = ({
  block,
  groupId,
  onBlockChange,
}: {
  block: BlockWithOptions
  groupId: string | undefined
  onBlockChange: (block: Partial<Block>) => void
}): JSX.Element | null => {
  const updateOptions = (options: BlockOptions) => {
    onBlockChange({ options } as Partial<Block>)
  }

  switch (block.type) {
    case InputBlockType.TEXT: {
      return (
        <TextInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.NUMBER: {
      return (
        <NumberInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.EMAIL: {
      return (
        <EmailInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.URL: {
      return (
        <UrlInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.DATE: {
      return (
        <DateInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.PHONE: {
      return (
        <PhoneInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.CHOICE: {
      return (
        <ButtonsBlockSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.PICTURE_CHOICE: {
      return (
        <PictureChoiceSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.PAYMENT: {
      return (
        <PaymentSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.RATING: {
      return (
        <RatingInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case InputBlockType.FILE: {
      return (
        <FileInputSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case LogicBlockType.SET_VARIABLE: {
      return (
        <SetVariableSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case LogicBlockType.REDIRECT: {
      return (
        <RedirectSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case LogicBlockType.SCRIPT: {
      return (
        <ScriptSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case LogicBlockType.TYPEBOT_LINK: {
      return (
        <TypebotLinkForm
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case LogicBlockType.WAIT: {
      return (
        <WaitSettings options={block.options} onOptionsChange={updateOptions} />
      )
    }
    case LogicBlockType.JUMP: {
      return groupId ? (
        <JumpSettings
          groupId={groupId}
          options={block.options}
          onOptionsChange={updateOptions}
        />
      ) : (
        <></>
      )
    }
    case LogicBlockType.AB_TEST: {
      return (
        <AbTestSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case IntegrationBlockType.GOOGLE_SHEETS: {
      return (
        <GoogleSheetsSettings
          options={block.options}
          onOptionsChange={updateOptions}
          blockId={block.id}
        />
      )
    }
    case IntegrationBlockType.GOOGLE_ANALYTICS: {
      return (
        <GoogleAnalyticsSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case IntegrationBlockType.ZAPIER: {
      return <ZapierSettings block={block} onOptionsChange={updateOptions} />
    }
    case IntegrationBlockType.MAKE_COM: {
      return <MakeComSettings block={block} onOptionsChange={updateOptions} />
    }
    case IntegrationBlockType.PABBLY_CONNECT: {
      return (
        <PabblyConnectSettings block={block} onOptionsChange={updateOptions} />
      )
    }
    case IntegrationBlockType.WEBHOOK: {
      return (
        <HttpRequestSettings block={block} onOptionsChange={updateOptions} />
      )
    }
    case IntegrationBlockType.EMAIL: {
      return (
        <SendEmailSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case IntegrationBlockType.CHATWOOT: {
      return (
        <ChatwootSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case IntegrationBlockType.OPEN_AI: {
      return <OpenAISettings block={block} onOptionsChange={updateOptions} />
    }
    case IntegrationBlockType.PIXEL: {
      return (
        <PixelSettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
    case IntegrationBlockType.ZEMANTIC_AI: {
      return (
        <ZemanticAiSettings block={block} onOptionsChange={updateOptions} />
      )
    }
    case LogicBlockType.CONDITION:
      return null
    default: {
      return (
        <ForgedBlockSettings block={block} onOptionsChange={updateOptions} />
      )
    }
  }
}
