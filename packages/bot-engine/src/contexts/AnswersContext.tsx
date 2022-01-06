import { Answer } from 'models'
import React, { createContext, ReactNode, useContext, useState } from 'react'

const answersContext = createContext<{
  answers: Answer[]
  addAnswer: (answer: Answer) => void
  //@ts-ignore
}>({})

export const AnswersContext = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId: string
}) => {
  const [answers, setAnswers] = useState<Answer[]>([])

  const addAnswer = (answer: Answer) =>
    setAnswers((answers) => [...answers, answer])

  return (
    <answersContext.Provider
      value={{
        answers,
        addAnswer,
      }}
    >
      {children}
    </answersContext.Provider>
  )
}

export const useAnswers = () => useContext(answersContext)
