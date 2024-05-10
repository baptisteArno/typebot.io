import { chakra } from '@chakra-ui/system'
import { colors } from 'libs/theme'
import { Block, Edge as EdgeProps } from 'models'
import React from 'react'
import { AnswersCount } from 'services/analytics'
import { DrawingEdge } from './DrawingEdge'
import { DropOffEdge } from './DropOffEdge'
import { Edge } from './Edge'

type Props = {
  edges: EdgeProps[]
  blocks: Block[]
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
}
export const Edges = ({
  edges,
  blocks,
  answersCounts,
  onUnlockProPlanClick,
}: Props) => {
  return (
    <chakra.svg
      width="full"
      height="full"
      overflow="visible"
      pos="absolute"
      left="0"
      top="0"
      pointerEvents="none"
      shapeRendering="geometricPrecision"
    >
      <DrawingEdge />
      {edges.map((edge) => {
        const b = blocks.find((b) => b.id === edge.from.blockId)
        return <Edge block={b || ({} as Block)} key={edge.id} edge={edge} />
      })}
      {answersCounts?.slice(1)?.map((answerCount) => (
        <DropOffEdge
          key={answerCount.blockId}
          answersCounts={answersCounts}
          blockId={answerCount.blockId}
          onUnlockProPlanClick={onUnlockProPlanClick}
        />
      ))}
      <marker
        id={'arrow'}
        refX="8"
        refY="4"
        orient="auto"
        viewBox="0 0 20 20"
        markerUnits="userSpaceOnUse"
        markerWidth="20"
        markerHeight="20"
      >
        <path
          d="M7.07138888,5.50174526 L2.43017246,7.82235347 C1.60067988,8.23709976 0.592024983,7.90088146 0.177278692,7.07138888 C0.0606951226,6.83822174 0,6.58111307 0,6.32042429 L0,1.67920787 C0,0.751806973 0.751806973,0 1.67920787,0 C1.93989666,0 2.19700532,0.0606951226 2.43017246,0.177278692 L7,3 C7.82949258,3.41474629 8.23709976,3.92128809 7.82235347,4.75078067 C7.6598671,5.07575341 7.39636161,5.33925889 7.07138888,5.50174526 Z"
          fill={colors.gray[400]}
        />
      </marker>
      <marker
        id={'blue-arrow'}
        refX="8"
        refY="4"
        orient="auto"
        viewBox="0 0 20 20"
        markerUnits="userSpaceOnUse"
        markerWidth="20"
        markerHeight="20"
      >
        <path
          d="M7.07138888,5.50174526 L2.43017246,7.82235347 C1.60067988,8.23709976 0.592024983,7.90088146 0.177278692,7.07138888 C0.0606951226,6.83822174 0,6.58111307 0,6.32042429 L0,1.67920787 C0,0.751806973 0.751806973,0 1.67920787,0 C1.93989666,0 2.19700532,0.0606951226 2.43017246,0.177278692 L7,3 C7.82949258,3.41474629 8.23709976,3.92128809 7.82235347,4.75078067 C7.6598671,5.07575341 7.39636161,5.33925889 7.07138888,5.50174526 Z"
          fill={colors.blue[400]}
        />
      </marker>
      <marker
        id={'red-arrow'}
        refX="8"
        refY="4"
        orient="auto"
        viewBox="0 0 20 20"
        markerUnits="userSpaceOnUse"
        markerWidth="20"
        markerHeight="20"
      >
        <path
          d="M7.07138888,5.50174526 L2.43017246,7.82235347 C1.60067988,8.23709976 0.592024983,7.90088146 0.177278692,7.07138888 C0.0606951226,6.83822174 0,6.58111307 0,6.32042429 L0,1.67920787 C0,0.751806973 0.751806973,0 1.67920787,0 C1.93989666,0 2.19700532,0.0606951226 2.43017246,0.177278692 L7,3 C7.82949258,3.41474629 8.23709976,3.92128809 7.82235347,4.75078067 C7.6598671,5.07575341 7.39636161,5.33925889 7.07138888,5.50174526 Z"
          fill="#e53e3e"
        />
      </marker>
    </chakra.svg>
  )
}
