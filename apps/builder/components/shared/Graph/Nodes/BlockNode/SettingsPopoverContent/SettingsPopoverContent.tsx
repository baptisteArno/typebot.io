import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
  IconButton,
} from '@chakra-ui/react'
import { ExpandIcon } from 'assets/icons'
import { ChatwootSettingsForm } from 'features/chatwoot/components'
import {
  ConditionItem,
  ConditionBlock,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  Block,
  BlockOptions,
  BlockWithOptions,
  Webhook,
} from 'models'
import { useRef } from 'react'
import {
  TextInputSettingsBody,
  NumberInputSettingsBody,
  EmailInputSettingsBody,
  UrlInputSettingsBody,
  DateInputSettingsBody,
} from './bodies'
import { ChoiceInputSettingsBody } from './bodies/ChoiceInputSettingsBody'
import { CodeSettings } from './bodies/CodeSettings'
import { ConditionSettingsBody } from './bodies/ConditionSettingsBody'
import { FileInputSettings } from './bodies/FileInputSettings'
import { GoogleAnalyticsSettings } from './bodies/GoogleAnalyticsSettings'
import { GoogleSheetsSettingsBody } from './bodies/GoogleSheetsSettingsBody'
import { PaymentSettings } from './bodies/PaymentSettings'
import { PhoneNumberSettingsBody } from './bodies/PhoneNumberSettingsBody'
import { RatingInputSettings } from './bodies/RatingInputSettingsBody'
import { RedirectSettings } from './bodies/RedirectSettings'
import { SendEmailSettings } from './bodies/SendEmailSettings'
import { SetVariableSettings } from './bodies/SetVariableSettings'
import { TypebotLinkSettingsForm } from './bodies/TypebotLinkSettingsForm'
import { WebhookSettings } from './bodies/WebhookSettings'
import { ZapierSettings } from './bodies/ZapierSettings'

type Props = {
  block: BlockWithOptions | ConditionBlock
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
          pt="10"
          pb="6"
          overflowY="scroll"
          maxH="400px"
          ref={ref}
          shadow="lg"
        >
          <BlockSettings {...props} />
        </PopoverBody>
        <IconButton
          pos="absolute"
          top="5px"
          right="5px"
          aria-label="expand"
          icon={<ExpandIcon />}
          size="xs"
          onClick={onExpandClick}
        />
      </PopoverContent>
    </Portal>
  )
}

export const BlockSettings = ({
  block,
  onBlockChange,
}: {
  block: BlockWithOptions | ConditionBlock
  webhook?: Webhook
  onBlockChange: (block: Partial<Block>) => void
}): JSX.Element => {
  const handleOptionsChange = (options: BlockOptions) => {
    onBlockChange({ options } as Partial<Block>)
  }
  const handleItemChange = (updates: Partial<ConditionItem>) => {
    onBlockChange({
      items: [{ ...(block as ConditionBlock).items[0], ...updates }],
    } as Partial<Block>)
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
        <ChoiceInputSettingsBody
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
    case LogicBlockType.CONDITION: {
      return (
        <ConditionSettingsBody block={block} onItemChange={handleItemChange} />
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
        <TypebotLinkSettingsForm
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
      return (
        <WebhookSettings
          block={block}
          onOptionsChange={handleOptionsChange}
          provider={{
            name: 'Make.com',
            url: 'https://eu1.make.com/app/invite/43fa76a621f67ea27f96cffc3a2477e1',
          }}
        />
      )
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
