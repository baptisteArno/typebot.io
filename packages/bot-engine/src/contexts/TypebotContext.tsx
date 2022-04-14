import { Log } from 'db'
import { Edge, PublicTypebot, Typebot } from 'models'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

export type LinkedTypebot = Pick<
  PublicTypebot | Typebot,
  'id' | 'blocks' | 'variables' | 'edges'
>
const typebotContext = createContext<{
  currentTypebotId: string
  typebot: PublicTypebot
  linkedTypebots: LinkedTypebot[]
  apiHost: string
  isPreview: boolean
  linkedBotEdgeIdsQueue: string[]
  setCurrentTypebotId: (id: string) => void
  updateVariableValue: (variableId: string, value: string) => void
  createEdge: (edge: Edge) => void
  injectLinkedTypebot: (typebot: Typebot | PublicTypebot) => LinkedTypebot
  popEdgeIdFromLinkedTypebotQueue: () => void
  pushEdgeIdInLinkedTypebotQueue: (edgeId: string) => void
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const TypebotContext = ({
  children,
  typebot,
  apiHost,
  isPreview,
  onNewLog,
}: {
  children: ReactNode
  typebot: PublicTypebot
  apiHost: string
  isPreview: boolean
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
}) => {
  const [localTypebot, setLocalTypebot] = useState<PublicTypebot>(typebot)
  const [linkedTypebots, setLinkedTypebots] = useState<LinkedTypebot[]>([])
  const [currentTypebotId, setCurrentTypebotId] = useState(typebot.typebotId)
  const [linkedBotEdgeIdsQueue, setLinkedBotEdgeIdsQueue] = useState<string[]>(
    []
  )

  useEffect(() => {
    setLocalTypebot((localTypebot) => ({
      ...localTypebot,
      theme: typebot.theme,
      settings: typebot.settings,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot.theme, typebot.settings])

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

  const injectLinkedTypebot = (typebot: Typebot | PublicTypebot) => {
    const typebotToInject = {
      id: 'typebotId' in typebot ? typebot.typebotId : typebot.id,
      blocks: typebot.blocks,
      edges: typebot.edges,
      variables: typebot.variables,
    }
    setLinkedTypebots((typebots) => [...typebots, typebotToInject])
    const updatedTypebot = {
      ...localTypebot,
      blocks: [...localTypebot.blocks, ...typebotToInject.blocks],
      variables: [...localTypebot.variables, ...typebotToInject.variables],
      edges: [...localTypebot.edges, ...typebotToInject.edges],
    }
    setLocalTypebot(updatedTypebot)
    return typebotToInject
  }

  const pushEdgeIdInLinkedTypebotQueue = (edgeId: string) =>
    setLinkedBotEdgeIdsQueue((queue) => [...queue, edgeId])

  const popEdgeIdFromLinkedTypebotQueue = () =>
    setLinkedBotEdgeIdsQueue((queue) => queue.slice(1))

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        linkedTypebots,
        apiHost,
        isPreview,
        updateVariableValue,
        createEdge,
        injectLinkedTypebot,
        onNewLog,
        linkedBotEdgeIdsQueue,
        pushEdgeIdInLinkedTypebotQueue,
        popEdgeIdFromLinkedTypebotQueue,
        currentTypebotId,
        setCurrentTypebotId,
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)
