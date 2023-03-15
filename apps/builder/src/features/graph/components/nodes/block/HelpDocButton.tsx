import { BuoyIcon } from '@/components/icons'
import { Button, Link } from '@chakra-ui/react'
import {
  BlockWithOptions,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
} from '@typebot.io/schemas'
import React from 'react'

type HelpDocButtonProps = {
  blockType: BlockWithOptions['type']
}

export const HelpDocButton = ({ blockType }: HelpDocButtonProps) => {
  const helpDocUrl = getHelpDocUrl(blockType)

  if (helpDocUrl === null) return null

  return (
    <Button
      as={Link}
      leftIcon={<BuoyIcon />}
      size="xs"
      href={helpDocUrl}
      isExternal
    >
      Help
    </Button>
  )
}

const getHelpDocUrl = (blockType: BlockWithOptions['type']): string | null => {
  switch (blockType) {
    case LogicBlockType.TYPEBOT_LINK:
      return 'https://docs.typebot.io/editor/blocks/logic/typebot-link'
    case LogicBlockType.SET_VARIABLE:
      return 'https://docs.typebot.io/editor/blocks/logic/set-variable'
    case LogicBlockType.REDIRECT:
      return 'https://docs.typebot.io/editor/blocks/logic/redirect'
    case LogicBlockType.SCRIPT:
      return 'https://docs.typebot.io/editor/blocks/logic/script'
    case LogicBlockType.WAIT:
      return 'https://docs.typebot.io/editor/blocks/logic/wait'
    case InputBlockType.TEXT:
      return 'https://docs.typebot.io/editor/blocks/inputs/text'
    case InputBlockType.NUMBER:
      return 'https://docs.typebot.io/editor/blocks/inputs/number'
    case InputBlockType.EMAIL:
      return 'https://docs.typebot.io/editor/blocks/inputs/email'
    case InputBlockType.URL:
      return 'https://docs.typebot.io/editor/blocks/inputs/website'
    case InputBlockType.DATE:
      return 'https://docs.typebot.io/editor/blocks/inputs/date'
    case InputBlockType.PHONE:
      return 'https://docs.typebot.io/editor/blocks/inputs/phone-number'
    case InputBlockType.CHOICE:
      return 'https://docs.typebot.io/editor/blocks/inputs/buttons'
    case InputBlockType.PAYMENT:
      return 'https://docs.typebot.io/editor/blocks/inputs/payment'
    case InputBlockType.RATING:
      return 'https://docs.typebot.io/editor/blocks/inputs/rating'
    case InputBlockType.FILE:
      return 'https://docs.typebot.io/editor/blocks/inputs/file-upload'
    case IntegrationBlockType.EMAIL:
      return 'https://docs.typebot.io/editor/blocks/integrations/email'
    case IntegrationBlockType.CHATWOOT:
      return 'https://docs.typebot.io/editor/blocks/integrations/chatwoot'
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return 'https://docs.typebot.io/editor/blocks/integrations/ga'
    case IntegrationBlockType.GOOGLE_SHEETS:
      return 'https://docs.typebot.io/editor/blocks/integrations/google-sheets'
    case IntegrationBlockType.ZAPIER:
      return 'https://docs.typebot.io/editor/blocks/integrations/zapier'
    case IntegrationBlockType.PABBLY_CONNECT:
      return 'https://docs.typebot.io/editor/blocks/integrations/pabbly'
    case IntegrationBlockType.WEBHOOK:
      return 'https://docs.typebot.io/editor/blocks/integrations/webhook'
    default:
      return null
  }
}
