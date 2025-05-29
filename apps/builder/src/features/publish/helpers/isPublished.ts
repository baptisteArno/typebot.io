import { Typebot, PublicTypebot } from '@typebot.io/schemas'
import { diff } from 'deep-object-diff'
import { dequal } from 'dequal'
import logger from '@/helpers/logger'

export const isPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot,
  debug?: boolean
) => {
  if (debug)
    logger.info(
      'diff:',
      diff(
        JSON.parse(JSON.stringify(typebot.groups)),
        JSON.parse(JSON.stringify(publicTypebot.groups))
      )
    )
  const published =
    dequal(
      JSON.parse(JSON.stringify(typebot.groups)),
      JSON.parse(JSON.stringify(publicTypebot.groups))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.settings)),
      JSON.parse(JSON.stringify(publicTypebot.settings))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.theme)),
      JSON.parse(JSON.stringify(publicTypebot.theme))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.variables)),
      JSON.parse(JSON.stringify(publicTypebot.variables))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.events)),
      JSON.parse(JSON.stringify(publicTypebot.events))
    )

  if (!published) {
    logger.info('Typebot is not published', {
      typebotId: typebot.id,
      workspaceId: typebot.workspaceId,
    })
  }

  return published
}
