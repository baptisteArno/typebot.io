import { safeStringify } from '@/features/variables'
import {
  AnswerInput,
  ResultValues,
  VariableWithUnknowValue,
  VariableWithValue,
} from 'models'
import { createContext, ReactNode, useContext, useState } from 'react'
import { isDefined } from 'utils'

const answersContext = createContext<{
  resultId?: string
  resultValues: ResultValues
  addAnswer: (
    answer: AnswerInput & { uploadedFiles: boolean }
  ) => Promise<void> | undefined
  updateVariables: (variables: VariableWithUnknowValue[]) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const AnswersProvider = ({
  children,
  resultId,
  onNewAnswer,
  onVariablesUpdated,
}: {
  resultId?: string
  onNewAnswer: (
    answer: AnswerInput & { uploadedFiles: boolean }
  ) => Promise<void> | undefined
  onVariablesUpdated?: (variables: VariableWithValue[]) => void
  children: ReactNode
}) => {
  const [resultValues, setResultValues] = useState<ResultValues>({
    answers: [],
    variables: [],
    createdAt: new Date(),
  })

  const addAnswer = (answer: AnswerInput & { uploadedFiles: boolean }) => {
    setResultValues((resultValues) => ({
      ...resultValues,
      answers: [...resultValues.answers, answer],
    }))
    return onNewAnswer && onNewAnswer(answer)
  }

  const updateVariables = (newVariables: VariableWithUnknowValue[]) => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: safeStringify(variable.value),
    }))

    setResultValues((resultValues) => {
      const updatedVariables = [
        ...resultValues.variables.filter((v) =>
          serializedNewVariables.every(
            (variable) => variable.id !== v.id || variable.name !== v.name
          )
        ),
        ...serializedNewVariables,
      ].filter((variable) => isDefined(variable.value)) as VariableWithValue[]
      if (onVariablesUpdated) onVariablesUpdated(updatedVariables)
      return {
        ...resultValues,
        variables: updatedVariables,
      }
    })
  }

  return (
    <answersContext.Provider
      value={{
        resultId,
        resultValues,
        addAnswer,
        updateVariables,
      }}
    >
      {children}
    </answersContext.Provider>
  )
}

export const useAnswers = () => useContext(answersContext)
