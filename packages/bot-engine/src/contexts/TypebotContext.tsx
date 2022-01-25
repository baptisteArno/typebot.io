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
      variables: {
        ...typebot.variables,
        byId: {
          ...typebot.variables.byId,
          [variableId]: { ...typebot.variables.byId[variableId], value },
        },
      },
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
