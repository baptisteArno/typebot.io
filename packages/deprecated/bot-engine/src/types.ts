import { Log } from '@sniper.io/prisma'
import {
  Edge,
  Group,
  PublicSniper,
  ResultValuesInput,
  Sniper,
  Variable,
  VariableWithUnknowValue,
} from '@sniper.io/schemas'
import { SniperViewerProps } from './components/SniperViewer'
import { LinkedSniper } from './providers/SniperProvider'

export type InputSubmitContent = {
  label?: string
  value: string
  itemId?: string
}

export type EdgeId = string

export type LogicState = {
  isPreview: boolean
  apiHost: string
  sniper: SniperViewerProps['sniper']
  linkedSnipers: LinkedSniper[]
  currentSniperId: string
  pushParentSniperId: (id: string) => void
  pushEdgeIdInLinkedSniperQueue: (bot: {
    edgeId: string
    sniperId: string
  }) => void
  setCurrentSniperId: (id: string) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  updateVariables: (variables: VariableWithUnknowValue[]) => void
  injectLinkedSniper: (sniper: Sniper | PublicSniper) => LinkedSniper
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  createEdge: (edge: Edge) => void
}

export type IntegrationState = {
  apiHost: string
  sniperId: string
  groupId: string
  blockId: string
  isPreview: boolean
  variables: Variable[]
  resultValues: ResultValuesInput
  groups: Group[]
  resultId?: string
  parentSniperIds: string[]
  updateVariables: (variables: VariableWithUnknowValue[]) => void
  updateVariableValue: (variableId: string, value: unknown) => void
  onNewLog: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
}
