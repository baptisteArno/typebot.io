import { option } from '@typebot.io/forge'
import { z } from '@typebot.io/forge/zod'
import { baseOptions } from '../baseOptions'

const nativeMessageContentSchema = {
  content: option.string.layout({
    inputType: 'textarea',
    placeholder: 'Content',
  }),
}

const systemMessageItemSchema = option
  .object({
    role: option.literal('system'),
  })
  .extend(nativeMessageContentSchema)

const userMessageItemSchema = option
  .object({
    role: option.literal('user'),
  })
  .extend(nativeMessageContentSchema)

const assistantMessageItemSchema = option
  .object({
    role: option.literal('assistant'),
  })
  .extend(nativeMessageContentSchema)

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

const dialogueMessageItemSchema = option.object({
  role: option.literal('Dialogue'),
  dialogueVariableId: option.string.layout({
    inputType: 'variableDropdown',
    placeholder: 'Dialogue variable',
  }),
  startsBy: option.enum(['user', 'assistant']).layout({
    label: 'starts by',
    direction: 'row',
    defaultValue: 'user',
  }),
})

type Props = {
  defaultModel?: string
  defaultTemperature?: number
  modelFetchId?: string
  modelHelperText?: string
}

export const parseChatCompletionOptions = ({
  defaultModel,
  defaultTemperature,
  modelFetchId,
  modelHelperText,
}: Props = {}) =>
  option.object({
    model: option.string.layout({
      placeholder: modelFetchId ? 'Select a model' : undefined,
      label: modelFetchId ? undefined : 'Model',
      defaultValue: defaultModel,
      fetcher: modelFetchId,
      helperText: modelHelperText,
    }),
    messages: option
      .array(
        option.discriminatedUnion('role', [
          systemMessageItemSchema,
          userMessageItemSchema,
          assistantMessageItemSchema,
          dialogueMessageItemSchema,
        ])
      )
      .layout({ accordion: 'Messages', itemLabel: 'message', isOrdered: true }),
    tools: option
      .array(option.discriminatedUnion('type', [functionToolItemSchema]))
      .layout({ accordion: 'Tools', itemLabel: 'tool' }),
    temperature: option.number.layout({
      accordion: 'Advanced settings',
      label: 'Temperature',
      direction: 'row',
      defaultValue: defaultTemperature,
    }),
    responseMapping: option
      .saveResponseArray(['Message content', 'Total tokens'] as const)
      .layout({
        accordion: 'Save response',
      }),
  })

export type ChatCompletionOptions = z.infer<
  ReturnType<typeof parseChatCompletionOptions>
> &
  z.infer<typeof baseOptions>
