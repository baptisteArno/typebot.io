import {
  AnswerInSessionState,
  Variable,
  VariableWithValue,
} from '@typebot.io/schemas'
import { isDefined, isEmpty } from '../lib/utils'

export const parseAnswers = ({
  answers,
  variables: resultVariables,
}: {
  answers: AnswerInSessionState[]
  variables: Variable[]
}): {
  [key: string]: string
} => {
  const variablesWithValues = resultVariables.filter((variable) =>
    isDefined(variable.value)
  ) as VariableWithValue[]

  return {
    submittedAt: new Date().toISOString(),
    ...[...answers, ...variablesWithValues].reduce<{
      [key: string]: string
    }>((o, answerOrVariable) => {
      if ('id' in answerOrVariable) {
        const variable = answerOrVariable
        if (variable.value === null) return o
        return { ...o, [variable.name]: variable.value.toString() }
      }
      const answer = answerOrVariable as AnswerInSessionState
      if (isEmpty(answer.key)) return o
      return {
        ...o,
        [answer.key]: answer.value,
      }
    }, {}),
  }
}
