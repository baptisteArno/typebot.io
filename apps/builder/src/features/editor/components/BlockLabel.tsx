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
      return <Text>Start</Text>
    case BubbleBlockType.TEXT:
    case InputBlockType.TEXT:
      return <Text>Text</Text>
    case BubbleBlockType.IMAGE:
      return <Text>Image</Text>
    case BubbleBlockType.VIDEO:
      return <Text>Video</Text>
    case BubbleBlockType.EMBED:
      return <Text>Embed</Text>
    case BubbleBlockType.AUDIO:
      return <Text>Audio</Text>
    case InputBlockType.NUMBER:
      return <Text>Number</Text>
    case InputBlockType.EMAIL:
      return <Text>Email</Text>
    case InputBlockType.URL:
      return <Text>Website</Text>
    case InputBlockType.DATE:
      return <Text>Date</Text>
    case InputBlockType.PHONE:
      return <Text>Phone</Text>
    case InputBlockType.CHOICE:
      return <Text>Button</Text>
    case InputBlockType.PAYMENT:
      return <Text>Payment</Text>
    case InputBlockType.RATING:
      return <Text>Rating</Text>
    case InputBlockType.FILE:
      return <Text>File</Text>
    case LogicBlockType.SET_VARIABLE:
      return <Text>Set variable</Text>
    case LogicBlockType.CONDITION:
      return <Text>Condition</Text>
    case LogicBlockType.REDIRECT:
      return <Text>Redirect</Text>
    case LogicBlockType.SCRIPT:
      return <Text>Script</Text>
    case LogicBlockType.TYPEBOT_LINK:
      return <Text>Typebot</Text>
    case LogicBlockType.WAIT:
      return <Text>Wait</Text>
    case LogicBlockType.JUMP:
      return <Text>Jump</Text>
    case LogicBlockType.AB_TEST:
      return <Text>AB Test</Text>
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <Text>Sheets</Text>
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <Text>Analytics</Text>
    case IntegrationBlockType.WEBHOOK:
      return <Text>Webhook</Text>
    case IntegrationBlockType.ZAPIER:
      return <Text>Zapier</Text>
    case IntegrationBlockType.MAKE_COM:
      return <Text>Make.com</Text>
    case IntegrationBlockType.PABBLY_CONNECT:
      return <Text>Pabbly</Text>
    case IntegrationBlockType.EMAIL:
      return <Text>Email</Text>
    case IntegrationBlockType.CHATWOOT:
      return <Text>Chatwoot</Text>
    case IntegrationBlockType.OPEN_AI:
      return <Text>OpenAI</Text>
  }
}
