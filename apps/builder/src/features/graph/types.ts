import { Group, Block, Source, IdMap, Target } from '@typebot.io/schemas'

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
  source: Source
  target?: Target
}

export type GroupsCoordinates = IdMap<Coordinates>

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
