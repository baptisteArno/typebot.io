import { Answer, Result } from '../models'
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

const resultContext = createContext<{
  result: Result
  setResult: Dispatch<SetStateAction<Result>>
  addAnswer: (answer: Answer) => void
  //@ts-ignore
}>({})

export const ResultContext = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId: string
}) => {
  const [result, setResult] = useState<Result>({
    id: 'tmp',
    createdAt: new Date(),
    updatedAt: new Date(),
    answers: [],
    typebotId,
    isCompleted: false,
  })

  const addAnswer = (answer: Answer) =>
    setResult({ ...result, answers: [...result.answers, answer] })

  return (
    <resultContext.Provider
      value={{
        result,
        setResult,
        addAnswer,
      }}
    >
      {children}
    </resultContext.Provider>
  )
}

export const useResult = () => useContext(resultContext)
