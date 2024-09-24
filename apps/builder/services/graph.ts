import { Edge, IdMap } from 'models'
import { AnchorsPositionProps } from 'components/shared/Graph/Edges/Edge'
import {
  stubLength,
  blockWidth,
  blockAnchorsOffset,
  Endpoint,
  Coordinates,
} from 'contexts/GraphContext'
import { roundCorners } from 'svg-round-corners'

const roundSize = 20

export const computeDropOffPath = (
  sourcePosition: Coordinates,
  sourceTop: number
) => {
  const sourceCoord = computeSourceCoordinates(sourcePosition, sourceTop)
  const segments = computeTwoSegments(sourceCoord, {
    x: sourceCoord.x + 20,
    y: sourceCoord.y + 80,
  })
  return roundCorners(
    `M${sourceCoord.x},${sourceCoord.y} ${segments}`,
    roundSize
  ).path
}

export const computeSourceCoordinates = (
  sourcePosition: Coordinates,
  sourceTop: number
) => ({
  x: sourcePosition.x + blockWidth,
  y: sourceTop,
})

const getSegments = ({
  sourcePosition,
  targetPosition,
  sourceType,
  totalSegments,
}: AnchorsPositionProps) => {
  switch (totalSegments) {
    case 2:
      return computeTwoSegments(sourcePosition, targetPosition)
    case 3:
      return computeThreeSegments(sourcePosition, targetPosition, sourceType)
    case 4:
      return computeFourSegments(sourcePosition, targetPosition, sourceType)
    default:
      return computeFiveSegments(sourcePosition, targetPosition, sourceType)
  }
}

const computeTwoSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates
) => {
  const segments = []
  segments.push(`L${targetPosition.x},${sourcePosition.y}`)
  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

const computeThreeSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: 'right' | 'left'
) => {
  const segments = []
  const firstSegmentX =
    sourceType === 'right'
      ? sourcePosition.x + (targetPosition.x - sourcePosition.x) / 2
      : sourcePosition.x - (sourcePosition.x - targetPosition.x) / 2
  segments.push(`L${firstSegmentX},${sourcePosition.y}`)
  segments.push(`L${firstSegmentX},${targetPosition.y}`)
  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

const computeFourSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: 'right' | 'left'
) => {
  const segments = []
  const firstSegmentX =
    sourcePosition.x + (sourceType === 'right' ? stubLength : -stubLength)
  segments.push(`L${firstSegmentX},${sourcePosition.y}`)
  const secondSegmentY =
    sourcePosition.y + (targetPosition.y - sourcePosition.y) / 2
  segments.push(`L${firstSegmentX},${secondSegmentY}`)

  segments.push(`L${targetPosition.x},${secondSegmentY}`)

  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

const computeFiveSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: 'right' | 'left'
) => {
  const segments = []
  const firstSegmentX =
    sourcePosition.x + (sourceType === 'right' ? stubLength : -stubLength)
  segments.push(`L${firstSegmentX},${sourcePosition.y}`)
  const firstSegmentY =
    sourcePosition.y + (targetPosition.y - sourcePosition.y) / 2
  segments.push(
    `L${
      sourcePosition.x + (sourceType === 'right' ? stubLength : -stubLength)
    },${firstSegmentY}`
  )

  const secondSegmentX =
    targetPosition.x - (sourceType === 'right' ? stubLength : -stubLength)
  segments.push(`L${secondSegmentX},${firstSegmentY}`)

  segments.push(`L${secondSegmentX},${targetPosition.y}`)

  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}

type GetAnchorsPositionParams = {
  sourceBlockCoordinates: Coordinates
  targetBlockCoordinates: Coordinates
  sourceTop: number
  targetTop?: number
  graphScale: number
}
export const getAnchorsPosition = ({
  sourceBlockCoordinates,
  targetBlockCoordinates,
  sourceTop,
  targetTop,
}: GetAnchorsPositionParams): AnchorsPositionProps => {
  const sourcePosition = computeSourceCoordinates(
    sourceBlockCoordinates,
    sourceTop
  )
  let sourceType: 'right' | 'left' = 'right'
  if (sourceBlockCoordinates.x > targetBlockCoordinates.x) {
    sourcePosition.x = sourceBlockCoordinates.x
    sourceType = 'left'
  }

  const { targetPosition, totalSegments } = computeBlockTargetPosition(
    sourceBlockCoordinates,
    targetBlockCoordinates,
    sourcePosition.y,
    targetTop
  )
  return { sourcePosition, targetPosition, sourceType, totalSegments }
}

const computeBlockTargetPosition = (
  sourceBlockPosition: Coordinates,
  targetBlockPosition: Coordinates,
  sourceOffsetY: number,
  targetOffsetY?: number
): { targetPosition: Coordinates; totalSegments: number } => {
  const isTargetBlockBelow =
    targetBlockPosition.y > sourceOffsetY &&
    targetBlockPosition.x < sourceBlockPosition.x + blockWidth + stubLength &&
    targetBlockPosition.x > sourceBlockPosition.x - blockWidth - stubLength
  const isTargetBlockToTheRight = targetBlockPosition.x < sourceBlockPosition.x
  const isTargettingBlock = !targetOffsetY

  if (isTargetBlockBelow && isTargettingBlock) {
    const isExterior =
      targetBlockPosition.x <
        sourceBlockPosition.x - blockWidth / 2 - stubLength ||
      targetBlockPosition.x >
        sourceBlockPosition.x + blockWidth / 2 + stubLength
    const targetPosition = parseBlockAnchorPosition(targetBlockPosition, 'top')
    return { totalSegments: isExterior ? 2 : 4, targetPosition }
  } else {
    const isExterior =
      targetBlockPosition.x < sourceBlockPosition.x - blockWidth ||
      targetBlockPosition.x > sourceBlockPosition.x + blockWidth
    const targetPosition = parseBlockAnchorPosition(
      targetBlockPosition,
      isTargetBlockToTheRight ? 'right' : 'left',
      targetOffsetY
    )
    return { totalSegments: isExterior ? 3 : 5, targetPosition }
  }
}

const parseBlockAnchorPosition = (
  blockPosition: Coordinates,
  anchor: 'left' | 'top' | 'right',
  targetOffsetY?: number
): Coordinates => {
  switch (anchor) {
    case 'left':
      return {
        x: blockPosition.x + blockAnchorsOffset.left.x,
        y: targetOffsetY ?? blockPosition.y + blockAnchorsOffset.left.y,
      }
    case 'top':
      return {
        x: blockPosition.x + blockAnchorsOffset.top.x,
        y: blockPosition.y + blockAnchorsOffset.top.y,
      }
    case 'right':
      return {
        x: blockPosition.x + blockAnchorsOffset.right.x,
        y: targetOffsetY ?? blockPosition.y + blockAnchorsOffset.right.y,
      }
  }
}

export const computeEdgePath = ({
  sourcePosition,
  targetPosition,
  sourceType,
  totalSegments,
}: AnchorsPositionProps) => {
  const segments = getSegments({
    sourcePosition,
    targetPosition,
    sourceType,
    totalSegments,
  })
  return roundCorners(
    `M${sourcePosition.x},${sourcePosition.y} ${segments}`,
    roundSize
  ).path
}

export const computeConnectingEdgePath = ({
  sourceBlockCoordinates,
  targetBlockCoordinates,
  sourceTop,
  targetTop,
  graphScale,
}: GetAnchorsPositionParams) => {
  const anchorsPosition = getAnchorsPosition({
    sourceBlockCoordinates,
    targetBlockCoordinates,
    sourceTop,
    targetTop,
    graphScale,
  })
  return computeEdgePath(anchorsPosition)
}

export const computeEdgePathToMouse = ({
  sourceBlockCoordinates,
  mousePosition,
  sourceTop,
}: {
  sourceBlockCoordinates: Coordinates
  mousePosition: Coordinates
  sourceTop: number
}): string => {
  const sourcePosition = {
    x:
      mousePosition.x - sourceBlockCoordinates.x > blockWidth / 2
        ? sourceBlockCoordinates.x + blockWidth
        : sourceBlockCoordinates.x,
    y: sourceTop,
  }
  const sourceType =
    mousePosition.x - sourceBlockCoordinates.x > blockWidth / 2
      ? 'right'
      : 'left'
  const segments = computeThreeSegments(
    sourcePosition,
    mousePosition,
    sourceType
  )
  return roundCorners(
    `M${sourcePosition.x},${sourcePosition.y} ${segments}`,
    roundSize
  ).path
}

export const getEndpointTopOffset = ({
  endpoints,
  graphOffsetY,
  endpointId,
  graphScale,
}: {
  endpoints: IdMap<Endpoint>
  graphOffsetY: number
  endpointId?: string
  graphScale: number
}): number | undefined => {
  if (!endpointId) return
  const endpointRef = endpoints[endpointId]?.ref
  if (!endpointRef?.current) return
  const endpointHeight = 28 * graphScale
  return (
    (endpointRef.current.getBoundingClientRect().y +
      endpointHeight / 2 -
      graphOffsetY) /
    graphScale
  )
}

export const getSourceEndpointId = (edge?: Edge) =>
  edge?.from.itemId ?? edge?.from.stepId

const computedItemHeight = (item) => {
  const base = (item.steps.length - 1) * 269 + 500
  const items = item.steps.filter((item) => item.hasOwnProperty('items'))
  const itemsLenght = items.reduce((a, c) => {
    return a + c.items.length
  }, 0)

  if (itemsLenght > 4) {
    return (itemsLenght - 4) * 52 + base
  }
  return base
}

export const isItemVisible = (
  item,
  graphPosition,
  containerWidth,
  containerHeight
) => {
  const { x, y, scale } = graphPosition

  const bufferX = 100 / scale + 500
  const bufferY = 100 / scale + 500

  const scaledItemX = Math.abs(
    item.graphCoordinates.x * scale + x - containerWidth / 2
  )
  const scaledItemY = Math.abs(
    item.graphCoordinates.y * scale + y - containerHeight / 2
  )

  const itemWidth = (313 + bufferX) * scale // Considerando a largura do item
  const itemHeight = (computedItemHeight(item) + bufferY) * scale // Considerando a altura do item

  const isHorizontallyVisible = scaledItemX - itemWidth < containerWidth / 2

  const isVerticallyVisible = scaledItemY - itemHeight < containerHeight / 2

  return isHorizontallyVisible && isVerticallyVisible
}
