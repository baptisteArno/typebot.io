import { SniperViewerProps } from '@/components/SniperViewer'
import { safeStringify } from '@/features/variables'
import { sendEventToParent } from '@/utils/chat'
import { Log } from '@sniper.io/prisma'
import { Edge, PublicSniper, Sniper, Variable } from '@sniper.io/schemas'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { isDefined } from '@sniper.io/lib'

export type LinkedSniper = Pick<
  PublicSniper | Sniper,
  'id' | 'groups' | 'variables' | 'edges'
>

export type LinkedSniperQueue = {
  sniperId: string
  edgeId: string
}[]

const sniperContext = createContext<{
  currentSniperId: string
  sniper: SniperViewerProps['sniper']
  linkedSnipers: LinkedSniper[]
  apiHost: string
  isPreview: boolean
  linkedBotQueue: LinkedSniperQueue
  isLoading: boolean
  parentSniperIds: string[]
  setCurrentSniperId: (id: string) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  createEdge: (edge: Edge) => void
  injectLinkedSniper: (sniper: Sniper | PublicSniper) => LinkedSniper
  pushParentSniperId: (sniperId: string) => void
  popEdgeIdFromLinkedSniperQueue: () => void
  pushEdgeIdInLinkedSniperQueue: (bot: {
    sniperId: string
    edgeId: string
  }) => void
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const SniperProvider = ({
  children,
  sniper,
  apiHost,
  isPreview,
  isLoading,
  onNewLog,
}: {
  children: ReactNode
  sniper: SniperViewerProps['sniper']
  apiHost: string
  isLoading: boolean
  isPreview: boolean
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
}) => {
  const [localSniper, setLocalSniper] =
    useState<SniperViewerProps['sniper']>(sniper)
  const [linkedSnipers, setLinkedSnipers] = useState<LinkedSniper[]>([])
  const [currentSniperId, setCurrentSniperId] = useState(sniper.sniperId)
  const [linkedBotQueue, setLinkedBotQueue] = useState<LinkedSniperQueue>([])
  const [parentSniperIds, setParentSniperIds] = useState<string[]>([])

  useEffect(() => {
    setLocalSniper((localSniper) => ({
      ...localSniper,
      theme: sniper.theme,
      settings: sniper.settings,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sniper.theme, sniper.settings])

  const updateVariableValue = (variableId: string, value: unknown) => {
    const formattedValue = safeStringify(value)

    sendEventToParent({
      newVariableValue: {
        name:
          localSniper.variables.find((variable) => variable.id === variableId)
            ?.name ?? '',
        value: formattedValue ?? '',
      },
    })

    const variable = localSniper.variables.find((v) => v.id === variableId)
    const otherVariablesWithSameName = localSniper.variables.filter(
      (v) => v.name === variable?.name && v.id !== variableId
    )
    const variablesToUpdate = [variable, ...otherVariablesWithSameName].filter(
      isDefined
    )

    setLocalSniper((sniper) => ({
      ...sniper,
      variables: sniper.variables.map((variable) =>
        variablesToUpdate.some(
          (variableToUpdate) => variableToUpdate.id === variable.id
        )
          ? { ...variable, value: formattedValue }
          : variable
      ),
    }))
  }

  const createEdge = (edge: Edge) => {
    setLocalSniper((sniper) => ({
      ...sniper,
      edges: [...sniper.edges, edge],
    }))
  }

  const injectLinkedSniper = (sniper: Sniper | PublicSniper) => {
    const newVariables = fillVariablesWithExistingValues(
      sniper.variables,
      localSniper.variables
    )
    const sniperToInject = {
      id: 'sniperId' in sniper ? sniper.sniperId : sniper.id,
      groups: sniper.groups,
      edges: sniper.edges,
      variables: newVariables,
    }
    setLinkedSnipers((snipers) => [...snipers, sniperToInject])
    const updatedSniper = {
      ...localSniper,
      groups: [...localSniper.groups, ...sniperToInject.groups],
      variables: [...localSniper.variables, ...sniperToInject.variables],
      edges: [...localSniper.edges, ...sniperToInject.edges],
    } as SniperViewerProps['sniper']
    setLocalSniper(updatedSniper)
    return sniperToInject
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

  const pushParentSniperId = (sniperId: string) => {
    setParentSniperIds((ids) => [...ids, sniperId])
  }

  const pushEdgeIdInLinkedSniperQueue = (bot: {
    sniperId: string
    edgeId: string
  }) => setLinkedBotQueue((queue) => [...queue, bot])

  const popEdgeIdFromLinkedSniperQueue = () => {
    setLinkedBotQueue((queue) => queue.slice(1))
    setParentSniperIds((ids) => ids.slice(1))
    setCurrentSniperId(linkedBotQueue[0].sniperId)
  }

  return (
    <sniperContext.Provider
      value={{
        sniper: localSniper,
        linkedSnipers,
        apiHost,
        isPreview,
        updateVariableValue,
        createEdge,
        injectLinkedSniper,
        onNewLog,
        linkedBotQueue,
        isLoading,
        parentSniperIds,
        pushParentSniperId,
        pushEdgeIdInLinkedSniperQueue,
        popEdgeIdFromLinkedSniperQueue,
        currentSniperId,
        setCurrentSniperId,
      }}
    >
      {children}
    </sniperContext.Provider>
  )
}

export const useSniper = () => useContext(sniperContext)
