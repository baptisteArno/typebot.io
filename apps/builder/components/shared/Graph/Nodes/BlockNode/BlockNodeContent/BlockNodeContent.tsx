import { Text } from '@chakra-ui/react'
import { ChatwootBlockNodeLabel } from 'features/chatwoot'
import {
  Block,
  StartBlock,
  BubbleBlockType,
  InputBlockType,
  LogicBlockType,
  IntegrationBlockType,
  BlockIndices,
} from 'models'
import { isChoiceInput, isInputBlock } from 'utils'
import { ItemNodesList } from '../../ItemNode'
import {
  EmbedBubbleContent,
  SetVariableContent,
  TextBubbleContent,
  VideoBubbleContent,
  WebhookContent,
  WithVariableContent,
} from './contents'
import { ConfigureContent } from './contents/ConfigureContent'
import { FileInputContent } from './contents/FileInputContent'
import { ImageBubbleContent } from './contents/ImageBubbleContent'
import { PaymentInputContent } from './contents/PaymentInputContent'
import { PlaceholderContent } from './contents/PlaceholderContent'
import { RatingInputContent } from './contents/RatingInputContent'
import { SendEmailContent } from './contents/SendEmailContent'
import { TypebotLinkContent } from './contents/TypebotLinkContent'
import { ProviderWebhookContent } from './contents/ZapierContent'

type Props = {
  block: Block | StartBlock
  indices: BlockIndices
}
export const BlockNodeContent = ({ block, indices }: Props): JSX.Element => {
  if (
    isInputBlock(block) &&
    !isChoiceInput(block) &&
    block.options.variableId
  ) {
    return <WithVariableContent block={block} />
  }
  switch (block.type) {
    case BubbleBlockType.TEXT: {
      return <TextBubbleContent block={block} />
    }
    case BubbleBlockType.IMAGE: {
      return <ImageBubbleContent block={block} />
    }
    case BubbleBlockType.VIDEO: {
      return <VideoBubbleContent block={block} />
    }
    case BubbleBlockType.EMBED: {
      return <EmbedBubbleContent block={block} />
    }
    case InputBlockType.TEXT: {
      return (
        <PlaceholderContent
          placeholder={block.options.labels.placeholder}
          isLong={block.options.isLong}
        />
      )
    }
    case InputBlockType.NUMBER:
    case InputBlockType.EMAIL:
    case InputBlockType.URL:
    case InputBlockType.PHONE: {
      return (
        <PlaceholderContent placeholder={block.options.labels.placeholder} />
      )
    }
    case InputBlockType.DATE: {
      return <Text color={'gray.500'}>Pick a date...</Text>
    }
    case InputBlockType.CHOICE: {
      return <ItemNodesList block={block} indices={indices} />
    }
    case InputBlockType.PAYMENT: {
      return <PaymentInputContent block={block} />
    }
    case InputBlockType.RATING: {
      return <RatingInputContent block={block} />
    }
    case InputBlockType.FILE: {
      return <FileInputContent options={block.options} />
    }
    case LogicBlockType.SET_VARIABLE: {
      return <SetVariableContent block={block} />
    }
    case LogicBlockType.CONDITION: {
      return <ItemNodesList block={block} indices={indices} isReadOnly />
    }
    case LogicBlockType.REDIRECT: {
      return (
        <ConfigureContent
          label={
            block.options?.url ? `Redirect to ${block.options?.url}` : undefined
          }
        />
      )
    }
    case LogicBlockType.CODE: {
      return (
        <ConfigureContent
          label={
            block.options?.content ? `Run ${block.options?.name}` : undefined
          }
        />
      )
    }
    case LogicBlockType.TYPEBOT_LINK:
      return <TypebotLinkContent block={block} />

    case IntegrationBlockType.GOOGLE_SHEETS: {
      return (
        <ConfigureContent
          label={
            block.options && 'action' in block.options
              ? block.options.action
              : undefined
          }
        />
      )
    }
    case IntegrationBlockType.GOOGLE_ANALYTICS: {
      return (
        <ConfigureContent
          label={
            block.options?.action
              ? `Track "${block.options?.action}" `
              : undefined
          }
        />
      )
    }
    case IntegrationBlockType.WEBHOOK: {
      return <WebhookContent block={block} />
    }
    case IntegrationBlockType.ZAPIER: {
      return (
        <ProviderWebhookContent block={block} configuredLabel="Trigger zap" />
      )
    }
    case IntegrationBlockType.PABBLY_CONNECT:
    case IntegrationBlockType.MAKE_COM: {
      return (
        <ProviderWebhookContent
          block={block}
          configuredLabel="Trigger scenario"
        />
      )
    }
    case IntegrationBlockType.EMAIL: {
      return <SendEmailContent block={block} />
    }
    case IntegrationBlockType.CHATWOOT: {
      return <ChatwootBlockNodeLabel block={block} />
    }
    case 'start': {
      return <Text>Start</Text>
    }
  }
}
