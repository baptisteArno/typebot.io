import { Answer, ResultValues, VariableWithValue } from 'models'
import React, { createContext, ReactNode, useContext, useState } from 'react'

const answersContext = createContext<{
  resultValues: ResultValues
  addAnswer: (answer: Answer) => void
  setPrefilledVariables: (variables: VariableWithValue[]) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const AnswersContext = ({
  children,
  onNewAnswer,
}: {
  onNewAnswer: (answer: Answer) => void
  children: ReactNode
}) => {
  const [resultValues, setResultValues] = useState<ResultValues>({
    answers: [],
    prefilledVariables: [],
    createdAt: new Date().toISOString(),
  })

  const addAnswer = (answer: Answer) => {
    setResultValues((resultValues) => ({
      ...resultValues,
      answers: [...resultValues.answers, answer],
    }))
    onNewAnswer(answer)
  }

  const setPrefilledVariables = (variables: VariableWithValue[]) =>
    setResultValues((resultValues) => ({
      ...resultValues,
      prefilledVariables: variables,
    }))

  return (
    <answersContext.Provider
      value={{
        resultValues,
        addAnswer,
        setPrefilledVariables,
      }}
    >
      {children}
    </answersContext.Provider>
  )
}

export const useAnswers = () => useContext(answersContext)
