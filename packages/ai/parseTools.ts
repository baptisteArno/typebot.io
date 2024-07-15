import { VariableStore } from '@typebot.io/forge'
import { z } from '@typebot.io/forge/zod'
import { executeFunction } from '@typebot.io/variables/executeFunction'
import { Variable } from '@typebot.io/variables/types'
import { CoreTool } from 'ai'
import { isNotEmpty } from '@typebot.io/lib'
import { Tools } from './schemas'

export const parseTools = ({
  tools,
  variables,
}: {
  tools: Tools
  variables: VariableStore
  onNewVariabes?: (newVariables: Variable[]) => void
}): Record<string, CoreTool> => {
  if (!tools?.length) return {}
  return tools.reduce<Record<string, CoreTool>>((acc, tool) => {
    if (!tool.code || !tool.name) return acc
    acc[tool.name] = {
      description: tool.description,
      parameters: parseParameters(tool.parameters),
      execute: async (args) => {
        const { output, newVariables } = await executeFunction({
          variables: variables.list(),
          args,
          body: tool.code!,
        })
        newVariables?.forEach((v) => variables.set(v.id, v.value))
        return output
      },
    } satisfies CoreTool
    return acc
  }, {})
}

const parseParameters = (
  parameters: NonNullable<Tools>[number]['parameters']
): z.ZodTypeAny | undefined => {
  if (!parameters || parameters?.length === 0) return

  const shape: z.ZodRawShape = {}
  parameters.forEach((param) => {
    if (!param.name) return
    switch (param.type) {
      case 'string':
        shape[param.name] = z.string()
        break
      case 'number':
        shape[param.name] = z.number()
        break
      case 'boolean':
        shape[param.name] = z.boolean()
        break
      case 'enum': {
        if (!param.values || param.values.length === 0) return
        shape[param.name] = z.enum(param.values as any)
        break
      }
    }
    if (isNotEmpty(param.description))
      shape[param.name] = shape[param.name].describe(param.description)
    if (param.required === false)
      shape[param.name] = shape[param.name].optional()
  })

  return z.object(shape)
}
