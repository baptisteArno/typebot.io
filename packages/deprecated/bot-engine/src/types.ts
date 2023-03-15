import { Log } from '@typebot.io/prisma'
import {
  Edge,
  Group,
  PublicTypebot,
  ResultValuesInput,
  Typebot,
  Variable,
  VariableWithUnknowValue,
} from '@typebot.io/schemas'
import { TypebotViewerProps } from './components/TypebotViewer'
import { LinkedTypebot } from './providers/TypebotProvider'

export type InputSubmitContent = {
  label?: string
  value: string
  itemId?: string
}

export type EdgeId = string

export type LogicState = {
  isPreview: boolean
  apiHost: string
  typebot: TypebotViewerProps['typebot']
  linkedTypebots: LinkedTypebot[]
  currentTypebotId: string
  pushParentTypebotId: (id: string) => void
  pushEdgeIdInLinkedTypebotQueue: (bot: {
    edgeId: string
    typebotId: string
  }) => void
  setCurrentTypebotId: (id: string) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  updateVariables: (variables: VariableWithUnknowValue[]) => void
  injectLinkedTypebot: (typebot: Typebot | PublicTypebot) => LinkedTypebot
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  createEdge: (edge: Edge) => void
}

export type IntegrationState = {
  apiHost: string
  typebotId: string
  groupId: string
  blockId: string
  isPreview: boolean
  variables: Variable[]
  resultValues: ResultValuesInput
  groups: Group[]
  resultId?: string
  parentTypebotIds: string[]
  updateVariables: (variables: VariableWithUnknowValue[]) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
}
