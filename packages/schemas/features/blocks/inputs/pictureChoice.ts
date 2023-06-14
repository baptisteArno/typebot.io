import { z } from 'zod'
import { ItemType } from '../../items/enums'
import { itemBaseSchema } from '../../items/baseSchemas'
import { optionBaseSchema, blockBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'
import { conditionSchema } from '../logic/condition'

export const pictureChoiceOptionsSchema = optionBaseSchema.merge(
  z.object({
    isMultipleChoice: z.boolean().optional(),
    isSearchable: z.boolean().optional(),
    buttonLabel: z.string(),
    searchInputPlaceholder: z.string(),
    dynamicItems: z
      .object({
        isEnabled: z.boolean().optional(),
        titlesVariableId: z.string().optional(),
        descriptionsVariableId: z.string().optional(),
        pictureSrcsVariableId: z.string().optional(),
      })
      .optional(),
  })
)

export const pictureChoiceItemSchema = itemBaseSchema.merge(
  z.object({
    type: z.literal(ItemType.PICTURE_CHOICE),
    pictureSrc: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    displayCondition: z
      .object({
        isEnabled: z.boolean().optional(),
        condition: conditionSchema.optional(),
      })
      .optional(),
  })
)

export const pictureChoiceBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.PICTURE_CHOICE]),
    items: z.array(pictureChoiceItemSchema),
    options: pictureChoiceOptionsSchema,
  })
)

export type PictureChoiceItem = z.infer<typeof pictureChoiceItemSchema>
export type PictureChoiceBlock = z.infer<typeof pictureChoiceBlockSchema>

export const defaultPictureChoiceOptions: PictureChoiceBlock['options'] = {
  buttonLabel: defaultButtonLabel,
  searchInputPlaceholder: 'Filter the options...',
}
