import { omit } from '@sniper.io/lib'
import { Sniper } from '@sniper.io/schemas'
import { dequal } from 'dequal'

export const areSnipersEqual = (sniperA: Sniper, sniperB: Sniper) =>
  dequal(
    JSON.parse(JSON.stringify(omit(sniperA, 'updatedAt'))),
    JSON.parse(JSON.stringify(omit(sniperB, 'updatedAt')))
  )
