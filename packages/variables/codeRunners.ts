import { Variable } from './types'
import ivm from 'isolated-vm'
import { parseGuessedValueType } from './parseGuessedValueType'

export interface DisposableRunner {
  (code: string): unknown
  dispose: () => void
}

export const createCodeRunner = ({
  variables,
}: {
  variables: Variable[]
}): DisposableRunner => {
  const isolate = new ivm.Isolate()
  try {
    const context = isolate.createContextSync()
    const jail = context.global
    jail.setSync('global', jail.derefInto())
    variables.forEach((v) => {
      jail.setSync(v.id, parseTransferrableValue(parseGuessedValueType(v.value)))
    })
    const runner = (code: string) => {
      return context.evalClosureSync(
        `return (function() {
    return new Function($0)();
  }())`,
        [code],
        { result: { copy: true }, timeout: 10000 }
      )
    }
      ; (runner as any).dispose = () => isolate.dispose()
    return runner as DisposableRunner
  } catch (err) {
    isolate.dispose()
    throw err
  }
}

export const createHttpReqResponseMappingRunner = (
  response: any
): DisposableRunner => {
  const isolate = new ivm.Isolate()
  try {
    const context = isolate.createContextSync()
    const jail = context.global
    jail.setSync('global', jail.derefInto())
    const copy = new ivm.ExternalCopy(response)
    try {
      jail.setSync('response', copy.copyInto())
    } finally {
      copy.release()
    }
    const runner = (expression: string) => {
      return context.evalClosureSync(
        `globalThis.evaluateExpression = function(expression) {
        try {
          // Use Function to safely evaluate the expression
          const func = new Function('statusCode', 'data', 'return (' + expression + ')');
          return func(response.statusCode, response.data);
        } catch (err) {
          throw new Error('Invalid expression: ' + err.message);
        }
      };
      return evaluateExpression.apply(null, arguments);`,
        [expression],
        {
          result: { copy: true },
          timeout: 10000,
        }
      )
    }
      ; (runner as any).dispose = () => isolate.dispose()
    return runner as DisposableRunner
  } catch (err) {
    isolate.dispose()
    throw err
  }
}

export const parseTransferrableValue = (value: unknown) => {
  if (typeof value === 'object' && value !== null) {
    const copy = new ivm.ExternalCopy(value)
    try {
      return copy.copyInto()
    } finally {
      copy.release()
    }
  }
  return value
}
