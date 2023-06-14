import { z } from 'zod'
import { ItemType } from '../../items/enums'
import { itemBaseSchema } from '../../items/baseSchemas'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'
import { conditionSchema } from '../logic/condition'

export const choiceInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    isMultipleChoice: z.boolean(),
    buttonLabel: z.string(),
    dynamicVariableId: z.string().optional(),
    isSearchable: z.boolean().optional(),
    searchInputPlaceholder: z.string().optional(),
  })
)

export const defaultChoiceInputOptions = {
  buttonLabel: defaultButtonLabel,
  searchInputPlaceholder: 'Filter the options...',
  isMultipleChoice: false,
  isSearchable: false,
} as const

export const buttonItemSchema = itemBaseSchema.merge(
  z.object({
    type: z.literal(ItemType.BUTTON),
    content: z.string().optional(),
    displayCondition: z
      .object({
        isEnabled: z.boolean().optional(),
        condition: conditionSchema.optional(),
      })
      .optional(),
  })
)

export const choiceInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.CHOICE]),
    items: z.array(buttonItemSchema),
    options: choiceInputOptionsSchema,
  })
)

export type ButtonItem = z.infer<typeof buttonItemSchema>
export type ChoiceInputBlock = z.infer<typeof choiceInputSchema>
export type ChoiceInputOptions = z.infer<typeof choiceInputOptionsSchema>
