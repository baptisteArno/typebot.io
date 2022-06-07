import { z } from 'zod'
import {
  stepBaseSchema,
  InputStepType,
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

export const choiceInputSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([InputStepType.CHOICE]),
    items: z.array(z.any()),
    options: choiceInputOptionsSchema,
  })
)

export const buttonItemSchema = itemBaseSchema.and(
  z.object({
    type: z.literal(ItemType.BUTTON),
    content: z.string().optional(),
  })
)

export type ButtonItem = z.infer<typeof buttonItemSchema>
export type ChoiceInputStep = z.infer<typeof choiceInputSchema>
export type ChoiceInputOptions = z.infer<typeof choiceInputOptionsSchema>
