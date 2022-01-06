import { PublicTypebot } from 'models'
import React, { createContext, ReactNode, useContext } from 'react'

const typebotContext = createContext<{
  typebot: PublicTypebot
  //@ts-ignore
}>({})

export const TypebotContext = ({
  children,
  typebot,
}: {
  children: ReactNode
  typebot: PublicTypebot
}) => {
  return (
    <typebotContext.Provider
      value={{
        typebot,
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)
