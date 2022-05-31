import { Answer, ResultValues, VariableWithValue } from 'models'
import React, { createContext, ReactNode, useContext, useState } from 'react'

const answersContext = createContext<{
  resultId?: string
  resultValues: ResultValues
  addAnswer: (answer: Answer) => Promise<void> | undefined
  updateVariables: (variables: VariableWithValue[]) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const AnswersContext = ({
  children,
  resultId,
  onNewAnswer,
  onVariablesUpdated,
}: {
  resultId?: string
  onNewAnswer: (answer: Answer) => Promise<void> | undefined
  onVariablesUpdated?: (variables: VariableWithValue[]) => void
  children: ReactNode
}) => {
  const [resultValues, setResultValues] = useState<ResultValues>({
    answers: [],
    variables: [],
    createdAt: new Date().toISOString(),
  })

  const addAnswer = (answer: Answer) => {
    setResultValues((resultValues) => ({
      ...resultValues,
      answers: [...resultValues.answers, answer],
    }))
    return onNewAnswer && onNewAnswer(answer)
  }

  const updateVariables = (variables: VariableWithValue[]) =>
    setResultValues((resultValues) => {
      const updatedVariables = [
        ...resultValues.variables.filter((v) =>
          variables.every((variable) => variable.id !== v.id)
        ),
        ...variables,
      ]
      if (onVariablesUpdated) onVariablesUpdated(updatedVariables)
      return {
        ...resultValues,
        variables: updatedVariables,
      }
    })

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
