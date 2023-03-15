import { Typebot, PublicTypebot } from '@typebot.io/schemas'
import { diff } from 'deep-object-diff'
import { dequal } from 'dequal'

export const isPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot,
  debug?: boolean
) => {
  if (debug)
    console.log(
      diff(
        JSON.parse(JSON.stringify(typebot.groups)),
        JSON.parse(JSON.stringify(publicTypebot.groups))
      )
    )
  return (
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
    )
  )
}
