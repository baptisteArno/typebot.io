import { z } from 'zod'
import { ItemType } from '../../items/enums'
import { itemBaseSchema } from '../../items/baseSchemas'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'

export const choiceInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    isMultipleChoice: z.boolean(),
    buttonLabel: z.string(),
    dynamicVariableId: z.string().optional(),
  })
)

export const defaultChoiceInputOptions: ChoiceInputOptions = {
  buttonLabel: defaultButtonLabel,
  isMultipleChoice: false,
}

export const buttonItemSchema = itemBaseSchema.merge(
  z.object({
    type: z.literal(ItemType.BUTTON),
    content: z.string().optional(),
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
