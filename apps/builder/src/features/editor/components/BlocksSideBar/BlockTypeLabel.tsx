import { HStack, Text, Tooltip } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace'
import { Plan } from 'db'
import {
  BubbleBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  BlockType,
} from 'models'
import React from 'react'
import { isFreePlan, LockTag } from '@/features/billing'

type Props = { type: BlockType }

export const BlockTypeLabel = ({ type }: Props): JSX.Element => {
  const { workspace } = useWorkspace()

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
      return (
        <Tooltip label="Embed a pdf, an iframe, a website...">
          <Text>Embed</Text>
        </Tooltip>
      )
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
      return (
        <Tooltip label="Upload Files">
          <HStack>
            <Text>File</Text>
            {isFreePlan(workspace) && <LockTag plan={Plan.STARTER} />}
          </HStack>
        </Tooltip>
      )
    case LogicBlockType.SET_VARIABLE:
      return <Text>Set variable</Text>
    case LogicBlockType.CONDITION:
      return <Text>Condition</Text>
    case LogicBlockType.REDIRECT:
      return <Text>Redirect</Text>
    case LogicBlockType.CODE:
      return (
        <Tooltip label="Run Javascript code">
          <Text>Code</Text>
        </Tooltip>
      )
    case LogicBlockType.TYPEBOT_LINK:
      return (
        <Tooltip label="Link to another of your typebots">
          <Text>Typebot</Text>
        </Tooltip>
      )
    case IntegrationBlockType.GOOGLE_SHEETS:
      return (
        <Tooltip label="Google Sheets">
          <Text>Sheets</Text>
        </Tooltip>
      )
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return (
        <Tooltip label="Google Analytics">
          <Text>Analytics</Text>
        </Tooltip>
      )
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
  }
}
