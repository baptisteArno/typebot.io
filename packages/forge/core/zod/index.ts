import { z } from 'zod'
import {
  extendWithTypebotLayout,
  ZodLayoutMetadata,
} from './extendWithTypebotLayout'

extendWithTypebotLayout(z)

export { z }
export type { ZodLayoutMetadata }
