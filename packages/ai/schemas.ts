import { option } from '@typebot.io/forge'
import { z } from '@typebot.io/forge/zod'

const parameterBase = {
  name: option.string.layout({
    label: 'Name',
    placeholder: 'myVariable',
    withVariableButton: false,
  }),
  description: option.string.layout({
    label: 'Description',
    withVariableButton: false,
  }),
  required: option.boolean.layout({
    label: 'Is required?',
  }),
}

export const toolParametersSchema = option
  .array(
    option.discriminatedUnion('type', [
      option
        .object({
          type: option.literal('string'),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal('number'),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal('boolean'),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal('enum'),
          values: option
            .array(option.string)
            .layout({ itemLabel: 'possible value' }),
        })
        .extend(parameterBase),
    ])
  )
  .layout({
    accordion: 'Parameters',
    itemLabel: 'parameter',
  })

const functionToolItemSchema = option.object({
  type: option.literal('function'),
  name: option.string.layout({
    label: 'Name',
    placeholder: 'myFunctionName',
    withVariableButton: false,
  }),
  description: option.string.layout({
    label: 'Description',
    placeholder: 'A brief description of what this function does.',
    withVariableButton: false,
  }),
  parameters: toolParametersSchema,
  code: option.string.layout({
    inputType: 'code',
    label: 'Code',
    lang: 'javascript',
    moreInfoTooltip:
      'A javascript code snippet that can use the defined parameters. It should return a value.',
    withVariableButton: false,
  }),
})

export const toolsSchema = option
  .array(option.discriminatedUnion('type', [functionToolItemSchema]))
  .layout({ accordion: 'Tools', itemLabel: 'tool' })

export type Tools = z.infer<typeof toolsSchema>
