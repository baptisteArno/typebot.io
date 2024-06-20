import { z } from 'zod'
import {
  extendWithSniperLayout,
  ZodLayoutMetadata,
} from './extendWithSniperLayout'

extendWithSniperLayout(z)

export { z }
export type { ZodLayoutMetadata }
