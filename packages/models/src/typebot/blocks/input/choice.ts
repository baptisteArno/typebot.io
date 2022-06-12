import { z } from 'zod'
import {
  blockBaseSchema,
  InputBlockType,
  defaultButtonLabel,
  optionBaseSchema,
  itemBaseSchema,
  ItemType,
} from '../shared'

export const choiceInputOptionsSchema = optionBaseSchema.and(
  z.object({
    isMultipleChoice: z.boolean(),
    buttonLabel: z.string(),
  })
)

export const defaultChoiceInputOptions: ChoiceInputOptions = {
  buttonLabel: defaultButtonLabel,
  isMultipleChoice: false,
}

export const buttonItemSchema = itemBaseSchema.and(
  z.object({
    type: z.literal(ItemType.BUTTON),
    content: z.string().optional(),
  })
)

export const choiceInputSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([InputBlockType.CHOICE]),
    items: z.array(buttonItemSchema),
    options: choiceInputOptionsSchema,
  })
)

export type ButtonItem = z.infer<typeof buttonItemSchema>
export type ChoiceInputBlock = z.infer<typeof choiceInputSchema>
export type ChoiceInputOptions = z.infer<typeof choiceInputOptionsSchema>
