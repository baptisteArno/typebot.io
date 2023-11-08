import { TypebotViewerProps } from '@/components/TypebotViewer'
import { safeStringify } from '@/features/variables'
import { sendEventToParent } from '@/utils/chat'
import { Log } from '@typebot.io/prisma'
import { Edge, PublicTypebot, Typebot, Variable } from '@typebot.io/schemas'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { isDefined } from '@typebot.io/lib'

export type LinkedTypebot = Pick<
  PublicTypebot | Typebot,
  'id' | 'groups' | 'variables' | 'edges'
>

export type LinkedTypebotQueue = {
  typebotId: string
  edgeId: string
}[]

const typebotContext = createContext<{
  currentTypebotId: string
  typebot: TypebotViewerProps['typebot']
  linkedTypebots: LinkedTypebot[]
  apiHost: string
  isPreview: boolean
  linkedBotQueue: LinkedTypebotQueue
  isLoading: boolean
  parentTypebotIds: string[]
  setCurrentTypebotId: (id: string) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  createEdge: (edge: Edge) => void
  injectLinkedTypebot: (typebot: Typebot | PublicTypebot) => LinkedTypebot
  pushParentTypebotId: (typebotId: string) => void
  popEdgeIdFromLinkedTypebotQueue: () => void
  pushEdgeIdInLinkedTypebotQueue: (bot: {
    typebotId: string
    edgeId: string
  }) => void
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const TypebotProvider = ({
  children,
  typebot,
  apiHost,
  isPreview,
  isLoading,
  onNewLog,
}: {
  children: ReactNode
  typebot: TypebotViewerProps['typebot']
  apiHost: string
  isLoading: boolean
  isPreview: boolean
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
}) => {
  const [localTypebot, setLocalTypebot] =
    useState<TypebotViewerProps['typebot']>(typebot)
  const [linkedTypebots, setLinkedTypebots] = useState<LinkedTypebot[]>([])
  const [currentTypebotId, setCurrentTypebotId] = useState(typebot.typebotId)
  const [linkedBotQueue, setLinkedBotQueue] = useState<LinkedTypebotQueue>([])
  const [parentTypebotIds, setParentTypebotIds] = useState<string[]>([])

  useEffect(() => {
    setLocalTypebot((localTypebot) => ({
      ...localTypebot,
      theme: typebot.theme,
      settings: typebot.settings,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot.theme, typebot.settings])

  const updateVariableValue = (variableId: string, value: unknown) => {
    const formattedValue = safeStringify(value)

    sendEventToParent({
      newVariableValue: {
        name:
          localTypebot.variables.find((variable) => variable.id === variableId)
            ?.name ?? '',
        value: formattedValue ?? '',
      },
    })

    const variable = localTypebot.variables.find((v) => v.id === variableId)
    const otherVariablesWithSameName = localTypebot.variables.filter(
      (v) => v.name === variable?.name && v.id !== variableId
    )
    const variablesToUpdate = [variable, ...otherVariablesWithSameName].filter(
      isDefined
    )

    setLocalTypebot((typebot) => ({
      ...typebot,
      variables: typebot.variables.map((variable) =>
        variablesToUpdate.some(
          (variableToUpdate) => variableToUpdate.id === variable.id
        )
          ? { ...variable, value: formattedValue }
          : variable
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
    const newVariables = fillVariablesWithExistingValues(
      typebot.variables,
      localTypebot.variables
    )
    const typebotToInject = {
      id: 'typebotId' in typebot ? typebot.typebotId : typebot.id,
      groups: typebot.groups,
      edges: typebot.edges,
      variables: newVariables,
    }
    setLinkedTypebots((typebots) => [...typebots, typebotToInject])
    const updatedTypebot = {
      ...localTypebot,
      groups: [...localTypebot.groups, ...typebotToInject.groups],
      variables: [...localTypebot.variables, ...typebotToInject.variables],
      edges: [...localTypebot.edges, ...typebotToInject.edges],
    } as TypebotViewerProps['typebot']
    setLocalTypebot(updatedTypebot)
    return typebotToInject
  }

  const fillVariablesWithExistingValues = (
    variables: Variable[],
    variablesWithValues: Variable[]
  ): Variable[] =>
    variables.map((variable) => {
      const matchedVariable = variablesWithValues.find(
        (variableWithValue) => variableWithValue.name === variable.name
      )

      return {
        ...variable,
        value: matchedVariable?.value ?? variable.value,
      }
    })

  const pushParentTypebotId = (typebotId: string) => {
    setParentTypebotIds((ids) => [...ids, typebotId])
  }

  const pushEdgeIdInLinkedTypebotQueue = (bot: {
    typebotId: string
    edgeId: string
  }) => setLinkedBotQueue((queue) => [...queue, bot])

  const popEdgeIdFromLinkedTypebotQueue = () => {
    setLinkedBotQueue((queue) => queue.slice(1))
    setParentTypebotIds((ids) => ids.slice(1))
    setCurrentTypebotId(linkedBotQueue[0].typebotId)
  }

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
        linkedBotQueue,
        isLoading,
        parentTypebotIds,
        pushParentTypebotId,
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
