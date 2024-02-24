import { Variable } from '@typebot.io/schemas'
import { parseVariables } from './parseVariables'
import { extractVariablesFromText } from './extractVariablesFromText'
import { parseGuessedValueType } from './parseGuessedValueType'
import { isDefined } from '@typebot.io/lib'
import { defaultTimeout } from '@typebot.io/schemas/features/blocks/integrations/webhook/constants'
import { safeStringify } from '@typebot.io/lib/safeStringify'

type Props = {
  variables: Variable[]
  body: string
  args?: Record<string, unknown>
}

export const executeFunction = async ({
  variables,
  body,
  args: initialArgs,
}: Props) => {
  const parsedBody = parseVariables(variables, { fieldToParse: 'id' })(body)

  const args = (
    extractVariablesFromText(variables)(body).map((variable) => ({
      id: variable.id,
      value: parseGuessedValueType(variable.value),
    })) as { id: string; value: unknown }[]
  ).concat(
    initialArgs
      ? Object.entries(initialArgs).map(([id, value]) => ({ id, value }))
      : []
  )
  const func = AsyncFunction(
    ...args.map(({ id }) => id),
    'setVariable',
    parsedBody
  )

  let updatedVariables: Record<string, any> = {}

  const setVariable = (key: string, value: any) => {
    updatedVariables[key] = value
  }
  const timeout = new Timeout()

  try {
    const output: unknown = await timeout.wrap(
      func(...args.map(({ value }) => value), setVariable),
      defaultTimeout * 1000
    )
    timeout.clear()
    return {
      output: safeStringify(output) ?? '',
      newVariables: Object.entries(updatedVariables)
        .map(([name, value]) => {
          const existingVariable = variables.find((v) => v.name === name)
          if (!existingVariable) return
          return {
            id: existingVariable.id,
            name: existingVariable.name,
            value,
          }
        })
        .filter(isDefined),
    }
  } catch (e) {
    console.log('Error while executing script')
    console.error(e)

    const error =
      typeof e === 'string'
        ? e
        : e instanceof Error
        ? e.message
        : JSON.stringify(e)

    return {
      error,
      output: error,
    }
  }
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

class Timeout {
  private ids: NodeJS.Timeout[]

  constructor() {
    this.ids = []
  }

  private set = (delay: number) =>
    new Promise((_, reject) => {
      const id = setTimeout(() => {
        reject(`Script ${defaultTimeout}s timeout reached`)
        this.clear(id)
      }, delay)
      this.ids.push(id)
    })

  wrap = (promise: Promise<any>, delay: number) =>
    Promise.race([promise, this.set(delay)])

  clear = (...ids: NodeJS.Timeout[]) => {
    this.ids = this.ids.filter((id) => {
      if (ids.includes(id)) {
        clearTimeout(id)
        return false
      }
      return true
    })
  }
}
