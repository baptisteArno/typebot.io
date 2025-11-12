import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'
import { variableStringSchema } from '../../../utils'

// Read max seconds from env (shared code - server or builder at build time)
const rawMax =
  process.env.WAIT_BLOCK_MAX_SECONDS ||
  process.env.NEXT_PUBLIC_WAIT_BLOCK_MAX_SECONDS ||
  '30'
const parsedMax = parseInt(rawMax, 10)
const MAX_WAIT_SECONDS =
  Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 30

export const waitOptionsSchema = z.object({
  secondsToWaitFor: z
    .union([
      // Variable reference like {{myVariable}}
      variableStringSchema,
      // Raw number string, will be parsed & clamped
      z.string().refine((val) => !isNaN(parseFloat(val)), {
        // i18n key consumed in UI layer when displaying zod errors
        message: 'blocks.logic.wait.validation.secondsOrVariable',
      }),
    ])
    .transform((val) => {
      // If matches variable schema, keep original (already validated)
      if (typeof val === 'string' && /^{{.+}}$/g.test(val)) {
        return val.trim()
      }
      const parsed = parseFloat(val as string)
      if (isNaN(parsed)) return undefined
      return Math.min(parsed, MAX_WAIT_SECONDS).toString()
    })
    .optional(),
  shouldPause: z.boolean().optional(),
})

export const waitBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.WAIT]),
    options: waitOptionsSchema.optional(),
  })
)

export type WaitBlock = z.infer<typeof waitBlockSchema>
