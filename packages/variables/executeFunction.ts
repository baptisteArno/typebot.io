import { parseVariables } from './parseVariables'
import { extractVariablesFromText } from './extractVariablesFromText'
import { parseGuessedValueType } from './parseGuessedValueType'
import { isDefined } from '@typebot.io/lib'
import { safeStringify } from '@typebot.io/lib/safeStringify'
import { Variable } from './types'
import ivm from 'isolated-vm'
import { parseTransferrableValue } from './codeRunners'
import { stringifyError } from '@typebot.io/lib/stringifyError'

const defaultTimeout = 10 * 1000

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
  const parsedBody = parseVariables(variables, {
    fieldToParse: 'id',
  })(body)

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

  let updatedVariables: Record<string, any> = {}

  const setVariable = (key: string, value: any) => {
    updatedVariables[key] = value
  }

  const isolate = new ivm.Isolate()
  const context = isolate.createContextSync()
  const jail = context.global
  jail.setSync('global', jail.derefInto())
  context.evalClosure(
    'globalThis.setVariable = (...args) => $0.apply(undefined, args, { arguments: { copy: true }, promise: true, result: { copy: true, promise: true } })',
    [new ivm.Reference(setVariable)]
  )
  context.evalClosure(
    'globalThis.fetch = (...args) => $0.apply(undefined, args, { arguments: { copy: true }, promise: true, result: { copy: true, promise: true } })',
    [
      new ivm.Reference(async (...args: any[]) => {
        // @ts-ignore
        const response = await fetch(...args)
        return response.text()
      }),
    ]
  )
  args.forEach(({ id, value }) => {
    jail.setSync(id, parseTransferrableValue(value))
  })
  const run = (code: string) =>
    context.evalClosure(
      `return (async function() {
		const AsyncFunction = async function () {}.constructor;
		return new AsyncFunction($0)();
	}())`,
      [code],
      { result: { copy: true, promise: true }, timeout: defaultTimeout }
    )

  try {
    const output = await run(parsedBody)
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

    const error = stringifyError(e)

    return {
      error,
      output: error,
    }
  }
}
