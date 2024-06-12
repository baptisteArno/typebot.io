//import { ForgedBlockDefinition } from '@typebot.io/forge-schemas'
import { BlockWithOptions } from '@typebot.io/schemas'
//import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
//import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
//import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

export const getHelpUrls = (
  blockType: BlockWithOptions['type']
): string | undefined => {
  switch (blockType) {
    default:
      return 'https://instant.getoutline.com/s/instantbuilder'
  }
}
