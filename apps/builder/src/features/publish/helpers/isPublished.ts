import { Sniper, PublicSniper } from '@sniper.io/schemas'
import { diff } from 'deep-object-diff'
import { dequal } from 'dequal'

export const isPublished = (
  sniper: Sniper,
  publicSniper: PublicSniper,
  debug?: boolean
) => {
  if (debug)
    console.log(
      'diff:',
      diff(
        JSON.parse(JSON.stringify(sniper.groups)),
        JSON.parse(JSON.stringify(publicSniper.groups))
      )
    )
  return (
    dequal(
      JSON.parse(JSON.stringify(sniper.groups)),
      JSON.parse(JSON.stringify(publicSniper.groups))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(sniper.settings)),
      JSON.parse(JSON.stringify(publicSniper.settings))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(sniper.theme)),
      JSON.parse(JSON.stringify(publicSniper.theme))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(sniper.variables)),
      JSON.parse(JSON.stringify(publicSniper.variables))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(sniper.events)),
      JSON.parse(JSON.stringify(publicSniper.events))
    )
  )
}
