import { Text } from '@chakra-ui/react'
import {
  BubbleBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  BlockType,
} from '@typebot.io/schemas'
import React from 'react'

type Props = { type: BlockType }

export const BlockLabel = ({ type }: Props): JSX.Element => {
  switch (type) {
    case 'start':
      return <Text fontSize="sm">Start</Text>
    case BubbleBlockType.TEXT:
    case InputBlockType.TEXT:
      return <Text fontSize="sm">Text</Text>
    case BubbleBlockType.IMAGE:
      return <Text fontSize="sm">Image</Text>
    case BubbleBlockType.VIDEO:
      return <Text fontSize="sm">Video</Text>
    case BubbleBlockType.EMBED:
      return <Text fontSize="sm">Embed</Text>
    case BubbleBlockType.AUDIO:
      return <Text fontSize="sm">Audio</Text>
    case InputBlockType.NUMBER:
      return <Text fontSize="sm">Number</Text>
    case InputBlockType.EMAIL:
      return <Text fontSize="sm">Email</Text>
    case InputBlockType.URL:
      return <Text fontSize="sm">Website</Text>
    case InputBlockType.DATE:
      return <Text fontSize="sm">Date</Text>
    case InputBlockType.PHONE:
      return <Text fontSize="sm">Phone</Text>
    case InputBlockType.CHOICE:
      return <Text fontSize="sm">Button</Text>
    case InputBlockType.PICTURE_CHOICE:
      return <Text fontSize="sm">Pic choice</Text>
    case InputBlockType.PAYMENT:
      return <Text fontSize="sm">Payment</Text>
    case InputBlockType.RATING:
      return <Text fontSize="sm">Rating</Text>
    case InputBlockType.FILE:
      return <Text fontSize="sm">File</Text>
    case LogicBlockType.SET_VARIABLE:
      return <Text fontSize="sm">Set variable</Text>
    case LogicBlockType.CONDITION:
      return <Text fontSize="sm">Condition</Text>
    case LogicBlockType.REDIRECT:
      return <Text fontSize="sm">Redirect</Text>
    case LogicBlockType.SCRIPT:
      return <Text fontSize="sm">Script</Text>
    case LogicBlockType.TYPEBOT_LINK:
      return <Text fontSize="sm">Typebot</Text>
    case LogicBlockType.WAIT:
      return <Text fontSize="sm">Wait</Text>
    case LogicBlockType.JUMP:
      return <Text fontSize="sm">Jump</Text>
    case LogicBlockType.AB_TEST:
      return <Text fontSize="sm">AB Test</Text>
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <Text fontSize="sm">Sheets</Text>
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <Text fontSize="sm">Analytics</Text>
    case IntegrationBlockType.WEBHOOK:
      return <Text fontSize="sm">Webhook</Text>
    case IntegrationBlockType.ZAPIER:
      return <Text fontSize="sm">Zapier</Text>
    case IntegrationBlockType.MAKE_COM:
      return <Text fontSize="sm">Make.com</Text>
    case IntegrationBlockType.PABBLY_CONNECT:
      return <Text fontSize="sm">Pabbly</Text>
    case IntegrationBlockType.EMAIL:
      return <Text fontSize="sm">Email</Text>
    case IntegrationBlockType.CHATWOOT:
      return <Text fontSize="sm">Chatwoot</Text>
    case IntegrationBlockType.OPEN_AI:
      return <Text fontSize="sm">OpenAI</Text>
  }
}
