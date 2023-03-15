import { chakra, useColorMode } from '@chakra-ui/react'
import { colors } from '@/lib/theme'
import { Edge as EdgeProps } from '@typebot.io/schemas'
import React from 'react'
import { AnswersCount } from '@/features/analytics/types'
import { DrawingEdge } from './DrawingEdge'
import { DropOffEdge } from './DropOffEdge'
import { Edge } from './Edge'

type Props = {
  edges: EdgeProps[]
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
}

export const Edges = ({
  edges,
  answersCounts,
  onUnlockProPlanClick,
}: Props) => {
  const isDark = useColorMode().colorMode === 'dark'
  return (
    <chakra.svg
      width="full"
      height="full"
      overflow="visible"
      pos="absolute"
      left="0"
      top="0"
      shapeRendering="geometricPrecision"
    >
      <DrawingEdge />
      {edges.map((edge) => (
        <Edge key={edge.id} edge={edge} />
      ))}
      {answersCounts?.map((answerCount) => (
        <DropOffEdge
          key={answerCount.groupId}
          answersCounts={answersCounts}
          groupId={answerCount.groupId}
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
          fill={isDark ? colors.gray[600] : colors.gray[400]}
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
