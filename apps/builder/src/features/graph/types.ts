import {
  Group,
  Block,
  IdMap,
  Target,
  BlockSource,
  TEventSource,
} from '@typebot.io/schemas'

export type Coordinates = { x: number; y: number }

export type Anchor = {
  coordinates: Coordinates
}

export type Node = Omit<Group, 'blocks'> & {
  blocks: (Block & {
    sourceAnchorsPosition: { left: Coordinates; right: Coordinates }
  })[]
}

export type ConnectingIds = {
  source: TEventSource | (BlockSource & { groupId: string })
  target?: Target
}

export type CoordinatesMap = IdMap<Coordinates>

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export type Endpoint = {
  id: string
  y: number
}
