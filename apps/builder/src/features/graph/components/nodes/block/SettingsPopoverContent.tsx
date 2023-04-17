import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
  IconButton,
  HStack,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ExpandIcon } from '@/components/icons'
import {
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  Block,
  BlockOptions,
  BlockWithOptions,
} from '@typebot.io/schemas'
import { useRef } from 'react'
import { HelpDocButton } from './HelpDocButton'
import { WaitSettings } from '@/features/blocks/logic/wait/components/WaitSettings'
import { ScriptSettings } from '@/features/blocks/logic/script/components/ScriptSettings'
import { JumpSettings } from '@/features/blocks/logic/jump/components/JumpSettings'
import { MakeComSettings } from '@/features/blocks/integrations/makeCom/components/MakeComSettings'
import { PabblyConnectSettings } from '@/features/blocks/integrations/pabbly/components/PabblyConnectSettings'
import { OpenAISettings } from '@/features/blocks/integrations/openai/components/OpenAISettings'
import { ButtonsBlockSettings } from '@/features/blocks/inputs/buttons/components/ButtonsBlockSettings'
import { FileInputSettings } from '@/features/blocks/inputs/fileUpload/components/FileInputSettings'
import { PaymentSettings } from '@/features/blocks/inputs/payment/components/PaymentSettings'
import { RatingInputSettings } from '@/features/blocks/inputs/rating/components/RatingInputSettings'
import { TextInputSettings } from '@/features/blocks/inputs/textInput/components/TextInputSettings'
import { GoogleAnalyticsSettings } from '@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsSettings'
import { SendEmailSettings } from '@/features/blocks/integrations/sendEmail/components/SendEmailSettings'
import { WebhookSettings } from '@/features/blocks/integrations/webhook/components/WebhookSettings'
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

type Props = {
  block: BlockWithOptions
  onExpandClick: () => void
  onBlockChange: (updates: Partial<Block>) => void
}

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const arrowColor = useColorModeValue('white', 'gray.800')
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
        <PopoverBody
          pt="3"
          pb="6"
          overflowY="scroll"
          maxH="400px"
          ref={ref}
          shadow="lg"
        >
          <Stack spacing={3}>
            <HStack justifyContent="flex-end">
              <HelpDocButton blockType={props.block.type} />
              <IconButton
                aria-label="expand"
                icon={<ExpandIcon />}
                size="xs"
                onClick={onExpandClick}
              />
            </HStack>
            <BlockSettings {...props} />
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Portal>
  )
}

export const BlockSettings = ({
  block,
  onBlockChange,
}: {
  block: BlockWithOptions
  onBlockChange: (block: Partial<Block>) => void
}): JSX.Element => {
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
      return (
        <JumpSettings
          groupId={block.groupId}
          options={block.options}
          onOptionsChange={updateOptions}
        />
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
      return <WebhookSettings block={block} onOptionsChange={updateOptions} />
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
      return (
        <OpenAISettings
          options={block.options}
          onOptionsChange={updateOptions}
        />
      )
    }
  }
}
