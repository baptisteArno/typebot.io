import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
  IconButton,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { ExpandIcon } from '@/components/icons'
import {
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  Block,
  BlockOptions,
  BlockWithOptions,
  Webhook,
} from 'models'
import { useRef } from 'react'
import { DateInputSettingsBody } from '@/features/blocks/inputs/date'
import { EmailInputSettingsBody } from '@/features/blocks/inputs/emailInput'
import { FileInputSettings } from '@/features/blocks/inputs/fileUpload'
import { NumberInputSettingsBody } from '@/features/blocks/inputs/number'
import { PaymentSettings } from '@/features/blocks/inputs/payment'
import { PhoneNumberSettingsBody } from '@/features/blocks/inputs/phone'
import { RatingInputSettings } from '@/features/blocks/inputs/rating'
import { TextInputSettingsBody } from '@/features/blocks/inputs/textInput'
import { UrlInputSettingsBody } from '@/features/blocks/inputs/url'
import { GoogleAnalyticsSettings } from '@/features/blocks/integrations/googleAnalytics'
import { GoogleSheetsSettingsBody } from '@/features/blocks/integrations/googleSheets'
import { SendEmailSettings } from '@/features/blocks/integrations/sendEmail'
import { WebhookSettings } from '@/features/blocks/integrations/webhook'
import { ZapierSettings } from '@/features/blocks/integrations/zapier'
import { CodeSettings } from '@/features/blocks/logic/code'
import { RedirectSettings } from '@/features/blocks/logic/redirect'
import { SetVariableSettings } from '@/features/blocks/logic/setVariable'
import { TypebotLinkForm } from '@/features/blocks/logic/typebotLink'
import { ButtonsOptionsForm } from '@/features/blocks/inputs/buttons'
import { ChatwootSettingsForm } from '@/features/blocks/integrations/chatwoot'
import { MakeComSettings } from '@/features/blocks/integrations/makeCom'
import { HelpDocButton } from './HelpDocButton'

type Props = {
  block: BlockWithOptions
  webhook?: Webhook
  onExpandClick: () => void
  onBlockChange: (updates: Partial<Block>) => void
}

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)
  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown} pos="relative">
        <PopoverArrow />
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
  webhook?: Webhook
  onBlockChange: (block: Partial<Block>) => void
}): JSX.Element => {
  const handleOptionsChange = (options: BlockOptions) => {
    onBlockChange({ options } as Partial<Block>)
  }

  switch (block.type) {
    case InputBlockType.TEXT: {
      return (
        <TextInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.NUMBER: {
      return (
        <NumberInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.EMAIL: {
      return (
        <EmailInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.URL: {
      return (
        <UrlInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.DATE: {
      return (
        <DateInputSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.PHONE: {
      return (
        <PhoneNumberSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.CHOICE: {
      return (
        <ButtonsOptionsForm
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.PAYMENT: {
      return (
        <PaymentSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.RATING: {
      return (
        <RatingInputSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case InputBlockType.FILE: {
      return (
        <FileInputSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.SET_VARIABLE: {
      return (
        <SetVariableSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.REDIRECT: {
      return (
        <RedirectSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.CODE: {
      return (
        <CodeSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case LogicBlockType.TYPEBOT_LINK: {
      return (
        <TypebotLinkForm
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationBlockType.GOOGLE_SHEETS: {
      return (
        <GoogleSheetsSettingsBody
          options={block.options}
          onOptionsChange={handleOptionsChange}
          blockId={block.id}
        />
      )
    }
    case IntegrationBlockType.GOOGLE_ANALYTICS: {
      return (
        <GoogleAnalyticsSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationBlockType.ZAPIER: {
      return <ZapierSettings block={block} />
    }
    case IntegrationBlockType.MAKE_COM: {
      return <MakeComSettings block={block} />
    }
    case IntegrationBlockType.PABBLY_CONNECT: {
      return (
        <WebhookSettings
          block={block}
          onOptionsChange={handleOptionsChange}
          provider={{
            name: 'Pabbly Connect',
            url: 'https://www.pabbly.com/connect/integrations/typebot/',
          }}
        />
      )
    }
    case IntegrationBlockType.WEBHOOK: {
      return (
        <WebhookSettings block={block} onOptionsChange={handleOptionsChange} />
      )
    }
    case IntegrationBlockType.EMAIL: {
      return (
        <SendEmailSettings
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    case IntegrationBlockType.CHATWOOT: {
      return (
        <ChatwootSettingsForm
          options={block.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
  }
}
