import { PublicTypebot } from 'models'
import React, { createContext, ReactNode, useContext, useState } from 'react'

const typebotContext = createContext<{
  typebot: PublicTypebot
  updateVariableValue: (variableId: string, value: string) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const TypebotContext = ({
  children,
  typebot,
}: {
  children: ReactNode
  typebot: PublicTypebot
}) => {
  const [localTypebot, setLocalTypebot] = useState<PublicTypebot>(typebot)

  const updateVariableValue = (variableId: string, value: string) => {
    setLocalTypebot((typebot) => ({
      ...typebot,
      variables: typebot.variables.map((v) =>
        v.id === variableId ? { ...v, value } : v
      ),
    }))
  }
  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        updateVariableValue,
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)
