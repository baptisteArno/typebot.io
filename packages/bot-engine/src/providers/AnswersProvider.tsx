import { safeStringify } from '@/features/variables'
import {
  Answer,
  ResultValues,
  VariableWithUnknowValue,
  VariableWithValue,
} from 'models'
import React, { createContext, ReactNode, useContext, useState } from 'react'

const answersContext = createContext<{
  resultId?: string
  resultValues: ResultValues
  addAnswer: (
    answer: Answer & { uploadedFiles: boolean }
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
    answer: Answer & { uploadedFiles: boolean }
  ) => Promise<void> | undefined
  onVariablesUpdated?: (variables: VariableWithValue[]) => void
  children: ReactNode
}) => {
  const [resultValues, setResultValues] = useState<ResultValues>({
    answers: [],
    variables: [],
    createdAt: new Date().toISOString(),
  })

  const addAnswer = (answer: Answer & { uploadedFiles: boolean }) => {
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
    })) as VariableWithValue[]

    setResultValues((resultValues) => {
      const updatedVariables = [
        ...resultValues.variables.filter((v) =>
          serializedNewVariables.every((variable) => variable.id !== v.id)
        ),
        ...serializedNewVariables,
      ]
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
