import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

type TranslateFunction = (key: string) => string

/**
 * Retorna o label traduzido para um tipo de bloco
 */
export const getBlockTypeLabel = (
  type: string,
  t: TranslateFunction
): string => {
  switch (type) {
    case 'start':
      return t('editor.sidebarBlock.start.label')
    case 'group':
      return t('editor.sidebarBlock.group.label')
    case BubbleBlockType.TEXT:
    case InputBlockType.TEXT:
      return t('editor.sidebarBlock.text.label')
    case BubbleBlockType.IMAGE:
      return t('editor.sidebarBlock.image.label')
    case BubbleBlockType.VIDEO:
      return t('editor.sidebarBlock.video.label')
    case BubbleBlockType.EMBED:
      return t('editor.sidebarBlock.embed.label')
    case BubbleBlockType.AUDIO:
      return t('editor.sidebarBlock.audio.label')
    case BubbleBlockType.NOTE:
      return t('editor.sidebarBlock.note.label')
    case InputBlockType.NUMBER:
      return t('editor.sidebarBlock.number.label')
    case InputBlockType.EMAIL:
      return t('editor.sidebarBlock.email.label')
    case InputBlockType.URL:
      return t('editor.sidebarBlock.website.label')
    case InputBlockType.DATE:
      return t('editor.sidebarBlock.date.label')
    case InputBlockType.PHONE:
      return t('editor.sidebarBlock.phone.label')
    case InputBlockType.CHOICE:
      return t('editor.sidebarBlock.button.label')
    case InputBlockType.PICTURE_CHOICE:
      return t('editor.sidebarBlock.picChoice.label')
    case InputBlockType.PAYMENT:
      return t('editor.sidebarBlock.payment.label')
    case InputBlockType.RATING:
      return t('editor.sidebarBlock.rating.label')
    case InputBlockType.FILE:
      return t('editor.sidebarBlock.file.label')
    case LogicBlockType.SET_VARIABLE:
      return t('editor.sidebarBlock.setVariable.label')
    case LogicBlockType.CONDITION:
      return t('editor.sidebarBlock.condition.label')
    case LogicBlockType.REDIRECT:
      return t('editor.sidebarBlock.redirect.label')
    case LogicBlockType.SCRIPT:
      return t('editor.sidebarBlock.script.label')
    case LogicBlockType.TYPEBOT_LINK:
      return t('editor.sidebarBlock.typebot.label')
    case LogicBlockType.WAIT:
      return t('editor.sidebarBlock.wait.label')
    case LogicBlockType.JUMP:
      return t('editor.sidebarBlock.jump.label')
    case LogicBlockType.AB_TEST:
      return t('editor.sidebarBlock.abTest.label')
    case IntegrationBlockType.GOOGLE_SHEETS:
      return t('editor.sidebarBlock.sheets.label')
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return t('editor.sidebarBlock.analytics.label')
    case IntegrationBlockType.WEBHOOK:
      return 'HTTP request'
    case IntegrationBlockType.ZAPIER:
      return t('editor.sidebarBlock.zapier.label')
    case IntegrationBlockType.MAKE_COM:
      return t('editor.sidebarBlock.makecom.label')
    case IntegrationBlockType.PABBLY_CONNECT:
      return t('editor.sidebarBlock.pabbly.label')
    case IntegrationBlockType.EMAIL:
      return t('editor.sidebarBlock.email.label')
    case IntegrationBlockType.CHATWOOT:
      return t('editor.sidebarBlock.chatwoot.label')
    case IntegrationBlockType.OPEN_AI:
      return t('editor.sidebarBlock.openai.label')
    case IntegrationBlockType.PIXEL:
      return t('editor.sidebarBlock.pixel.label')
    case IntegrationBlockType.ZEMANTIC_AI:
      return t('editor.sidebarBlock.zemanticAi.label')
    default:
      // Forged blocks ou desconhecidos retornam o tipo capitalizado
      return type
        .split(/[-_\s]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
  }
}
