import { PublicSniper, PublicSniperV6 } from '@sniper.io/schemas'
import { migrateSniperFromV3ToV4 } from './migrateSniperFromV3ToV4'
import { migrateSniperFromV5ToV6 } from './migrateSniperFromV5ToV6'

export const migrateSniper = async (
  sniper: PublicSniper
): Promise<PublicSniperV6> => {
  if (sniper.version === '6') return sniper
  let migratedSniper: any = sniper
  if (migratedSniper.version === '3')
    migratedSniper = await migrateSniperFromV3ToV4(sniper)
  if (migratedSniper.version === '4' || migratedSniper.version === '5')
    migratedSniper = migrateSniperFromV5ToV6(migratedSniper)
  return migratedSniper
}
