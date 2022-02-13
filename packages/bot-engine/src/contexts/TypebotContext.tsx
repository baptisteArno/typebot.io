import { Edge, PublicTypebot } from 'models'
import React, { createContext, ReactNode, useContext, useState } from 'react'

const typebotContext = createContext<{
  typebot: PublicTypebot
  apiHost: string
  isPreview: boolean
  updateVariableValue: (variableId: string, value: string) => void
  createEdge: (edge: Edge) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const TypebotContext = ({
  children,
  typebot,
  apiHost,
  isPreview,
}: {
  children: ReactNode
  typebot: PublicTypebot
  apiHost: string
  isPreview: boolean
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

  const createEdge = (edge: Edge) => {
    setLocalTypebot((typebot) => ({
      ...typebot,
      edges: [...typebot.edges, edge],
    }))
  }

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        apiHost,
        isPreview,
        updateVariableValue,
        createEdge,
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)
