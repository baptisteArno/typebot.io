import { omit } from '@typebot.io/lib'
import { Typebot } from '@typebot.io/schemas'
import { dequal } from 'dequal'

export const areTypebotsEqual = (typebotA: Typebot, typebotB: Typebot) =>
  dequal(
    JSON.parse(JSON.stringify(omit(typebotA, 'updatedAt'))),
    JSON.parse(JSON.stringify(omit(typebotB, 'updatedAt')))
  )
