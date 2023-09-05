import { Text } from '@chakra-ui/react'
import {
  BubbleBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
  BlockType,
} from '@typebot.io/schemas'
import React from 'react'
import { useScopedI18n } from '@/locales'

type Props = { type: BlockType }

export const BlockLabel = ({ type }: Props): JSX.Element => {
  const scopedT = useScopedI18n('editor.sidebarBlock')

  switch (type) {
    case 'start':
      return <Text fontSize="sm">{scopedT('start.label')}</Text>
    case BubbleBlockType.TEXT:
    case InputBlockType.TEXT:
      return <Text fontSize="sm">{scopedT('text.label')}</Text>
    case BubbleBlockType.IMAGE:
      return <Text fontSize="sm">{scopedT('image.label')}</Text>
    case BubbleBlockType.VIDEO:
      return <Text fontSize="sm">{scopedT('video.label')}</Text>
    case BubbleBlockType.EMBED:
      return <Text fontSize="sm">{scopedT('embed.label')}</Text>
    case BubbleBlockType.AUDIO:
      return <Text fontSize="sm">{scopedT('audio.label')}</Text>
    case InputBlockType.NUMBER:
      return <Text fontSize="sm">{scopedT('number.label')}</Text>
    case InputBlockType.EMAIL:
      return <Text fontSize="sm">{scopedT('email.label')}</Text>
    case InputBlockType.URL:
      return <Text fontSize="sm">{scopedT('website.label')}</Text>
    case InputBlockType.DATE:
      return <Text fontSize="sm">{scopedT('date.label')}</Text>
    case InputBlockType.PHONE:
      return <Text fontSize="sm">{scopedT('phone.label')}</Text>
    case InputBlockType.CHOICE:
      return <Text fontSize="sm">{scopedT('button.label')}</Text>
    case InputBlockType.PICTURE_CHOICE:
      return <Text fontSize="sm">{scopedT('picChoice.label')}</Text>
    case InputBlockType.PAYMENT:
      return <Text fontSize="sm">{scopedT('payment.label')}</Text>
    case InputBlockType.RATING:
      return <Text fontSize="sm">{scopedT('rating.label')}</Text>
    case InputBlockType.FILE:
      return <Text fontSize="sm">{scopedT('file.label')}</Text>
    case LogicBlockType.SET_VARIABLE:
      return <Text fontSize="sm">{scopedT('setVariable.label')}</Text>
    case LogicBlockType.CONDITION:
      return <Text fontSize="sm">{scopedT('condition.label')}</Text>
    case LogicBlockType.REDIRECT:
      return <Text fontSize="sm">{scopedT('redirect.label')}</Text>
    case LogicBlockType.SCRIPT:
      return <Text fontSize="sm">{scopedT('script.label')}</Text>
    case LogicBlockType.TYPEBOT_LINK:
      return <Text fontSize="sm">{scopedT('typebot.label')}</Text>
    case LogicBlockType.WAIT:
      return <Text fontSize="sm">{scopedT('wait.label')}</Text>
    case LogicBlockType.JUMP:
      return <Text fontSize="sm">{scopedT('jump.label')}</Text>
    case LogicBlockType.AB_TEST:
      return <Text fontSize="sm">{scopedT('abTest.label')}</Text>
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <Text fontSize="sm">{scopedT('sheets.label')}</Text>
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <Text fontSize="sm">{scopedT('analytics.label')}</Text>
    case IntegrationBlockType.WEBHOOK:
      return <Text fontSize="sm">{scopedT('webhook.label')}</Text>
    case IntegrationBlockType.ZAPIER:
      return <Text fontSize="sm">{scopedT('zapier.label')}</Text>
    case IntegrationBlockType.MAKE_COM:
      return <Text fontSize="sm">{scopedT('makecom.label')}</Text>
    case IntegrationBlockType.PABBLY_CONNECT:
      return <Text fontSize="sm">{scopedT('pabbly.label')}</Text>
    case IntegrationBlockType.EMAIL:
      return <Text fontSize="sm">{scopedT('email.label')}</Text>
    case IntegrationBlockType.CHATWOOT:
      return <Text fontSize="sm">{scopedT('chatwoot.label')}</Text>
    case IntegrationBlockType.OPEN_AI:
      return <Text fontSize="sm">{scopedT('openai.label')}</Text>
    case IntegrationBlockType.PIXEL:
      return <Text fontSize="sm">{scopedT('pixel.label')}</Text>
  }
}
