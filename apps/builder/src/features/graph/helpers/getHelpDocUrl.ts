import { ForgedBlockDefinition } from '@sniper.io/forge-repository/types'
import { BlockWithOptions } from '@sniper.io/schemas'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@sniper.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'

export const getHelpDocUrl = (
  blockType: BlockWithOptions['type'],
  blockDef?: ForgedBlockDefinition
): string | undefined => {
  switch (blockType) {
    case LogicBlockType.SNIPER_LINK:
      return 'https://docs.sniper.io/editor/blocks/logic/sniper-link'
    case LogicBlockType.SET_VARIABLE:
      return 'https://docs.sniper.io/editor/blocks/logic/set-variable'
    case LogicBlockType.REDIRECT:
      return 'https://docs.sniper.io/editor/blocks/logic/redirect'
    case LogicBlockType.SCRIPT:
      return 'https://docs.sniper.io/editor/blocks/logic/script'
    case LogicBlockType.WAIT:
      return 'https://docs.sniper.io/editor/blocks/logic/wait'
    case InputBlockType.TEXT:
      return 'https://docs.sniper.io/editor/blocks/inputs/text'
    case InputBlockType.NUMBER:
      return 'https://docs.sniper.io/editor/blocks/inputs/number'
    case InputBlockType.EMAIL:
      return 'https://docs.sniper.io/editor/blocks/inputs/email'
    case InputBlockType.URL:
      return 'https://docs.sniper.io/editor/blocks/inputs/website'
    case InputBlockType.DATE:
      return 'https://docs.sniper.io/editor/blocks/inputs/date'
    case InputBlockType.PHONE:
      return 'https://docs.sniper.io/editor/blocks/inputs/phone-number'
    case InputBlockType.CHOICE:
      return 'https://docs.sniper.io/editor/blocks/inputs/buttons'
    case InputBlockType.PAYMENT:
      return 'https://docs.sniper.io/editor/blocks/inputs/payment'
    case InputBlockType.RATING:
      return 'https://docs.sniper.io/editor/blocks/inputs/rating'
    case InputBlockType.FILE:
      return 'https://docs.sniper.io/editor/blocks/inputs/file-upload'
    case IntegrationBlockType.EMAIL:
      return 'https://docs.sniper.io/editor/blocks/integrations/email'
    case IntegrationBlockType.CHATWOOT:
      return 'https://docs.sniper.io/editor/blocks/integrations/chatwoot'
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return 'https://docs.sniper.io/editor/blocks/integrations/google-analytics'
    case IntegrationBlockType.GOOGLE_SHEETS:
      return 'https://docs.sniper.io/editor/blocks/integrations/google-sheets'
    case IntegrationBlockType.ZAPIER:
      return 'https://docs.sniper.io/editor/blocks/integrations/zapier'
    case IntegrationBlockType.PABBLY_CONNECT:
      return 'https://docs.sniper.io/editor/blocks/integrations/pabbly'
    case IntegrationBlockType.WEBHOOK:
      return 'https://docs.sniper.io/editor/blocks/integrations/webhook'
    case InputBlockType.PICTURE_CHOICE:
      return 'https://docs.sniper.io/editor/blocks/inputs/picture-choice'
    case IntegrationBlockType.OPEN_AI:
      return 'https://docs.sniper.io/editor/blocks/integrations/openai'
    case IntegrationBlockType.MAKE_COM:
      return 'https://docs.sniper.io/editor/blocks/integrations/make-com'
    case LogicBlockType.AB_TEST:
      return 'https://docs.sniper.io/editor/blocks/logic/abTest'
    case LogicBlockType.JUMP:
      return 'https://docs.sniper.io/editor/blocks/logic/jump'
    case IntegrationBlockType.PIXEL:
      return 'https://docs.sniper.io/editor/blocks/integrations/pixel'
    case IntegrationBlockType.ZEMANTIC_AI:
      return 'https://docs.sniper.io/editor/blocks/integrations/zemantic-ai'
    case LogicBlockType.CONDITION:
      return 'https://docs.sniper.io/editor/blocks/logic/condition'
    default:
      return blockDef?.docsUrl
  }
}
