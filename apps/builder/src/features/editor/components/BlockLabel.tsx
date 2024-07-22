import { Text, TextProps } from '@chakra-ui/react'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { Block } from '@typebot.io/schemas'
import { ForgedBlockLabel } from '@/features/forge/ForgedBlockLabel'

type Props = { type: Block['type'] } & TextProps

export const BlockLabel = ({ type, ...props }: Props): JSX.Element => {
  const { t } = useTranslate()

  switch (type) {
    case 'start':
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.start.label')}
        </Text>
      )
    case BubbleBlockType.TEXT:
    case InputBlockType.TEXT:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.text.label')}
        </Text>
      )
    case BubbleBlockType.IMAGE:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.image.label')}
        </Text>
      )
    case BubbleBlockType.VIDEO:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.video.label')}
        </Text>
      )
    case BubbleBlockType.EMBED:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.embed.label')}
        </Text>
      )
    case BubbleBlockType.AUDIO:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.audio.label')}
        </Text>
      )
    case InputBlockType.NUMBER:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.number.label')}
        </Text>
      )
    case InputBlockType.EMAIL:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.email.label')}
        </Text>
      )
    case InputBlockType.URL:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.website.label')}
        </Text>
      )
    case InputBlockType.DATE:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.date.label')}
        </Text>
      )
    case InputBlockType.PHONE:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.phone.label')}
        </Text>
      )
    case InputBlockType.CHOICE:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.button.label')}
        </Text>
      )
    case InputBlockType.PICTURE_CHOICE:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.picChoice.label')}
        </Text>
      )
    case InputBlockType.PAYMENT:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.payment.label')}
        </Text>
      )
    case InputBlockType.RATING:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.rating.label')}
        </Text>
      )
    case InputBlockType.FILE:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.file.label')}
        </Text>
      )
    case LogicBlockType.SET_VARIABLE:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.setVariable.label')}
        </Text>
      )
    case LogicBlockType.CONDITION:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.condition.label')}
        </Text>
      )
    case LogicBlockType.REDIRECT:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.redirect.label')}
        </Text>
      )
    case LogicBlockType.SCRIPT:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.script.label')}
        </Text>
      )
    case LogicBlockType.TYPEBOT_LINK:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.typebot.label')}
        </Text>
      )
    case LogicBlockType.WAIT:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.wait.label')}
        </Text>
      )
    case LogicBlockType.JUMP:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.jump.label')}
        </Text>
      )
    case LogicBlockType.AB_TEST:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.abTest.label')}
        </Text>
      )
    case IntegrationBlockType.GOOGLE_SHEETS:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.sheets.label')}
        </Text>
      )
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.analytics.label')}
        </Text>
      )
    case IntegrationBlockType.WEBHOOK:
      return (
        <Text fontSize="sm" {...props}>
          HTTP request
        </Text>
      )
    case IntegrationBlockType.ZAPIER:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.zapier.label')}
        </Text>
      )
    case IntegrationBlockType.MAKE_COM:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.makecom.label')}
        </Text>
      )
    case IntegrationBlockType.PABBLY_CONNECT:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.pabbly.label')}
        </Text>
      )
    case IntegrationBlockType.EMAIL:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.email.label')}
        </Text>
      )
    case IntegrationBlockType.CHATWOOT:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.chatwoot.label')}
        </Text>
      )
    case IntegrationBlockType.OPEN_AI:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.openai.label')}
        </Text>
      )
    case IntegrationBlockType.PIXEL:
      return (
        <Text fontSize="sm" {...props}>
          {t('editor.sidebarBlock.pixel.label')}
        </Text>
      )
    default:
      return <ForgedBlockLabel type={type} {...props} />
  }
}
