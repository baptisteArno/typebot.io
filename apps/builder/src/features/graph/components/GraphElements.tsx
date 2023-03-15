import { AnswersCount } from '@/features/analytics/types'
import { Edge, Group } from '@typebot.io/schemas'
import React, { memo } from 'react'
import { EndpointsProvider } from '../providers/EndpointsProvider'
import { Edges } from './edges/Edges'
import { GroupNode } from './nodes/group'

type Props = {
  edges: Edge[]
  groups: Group[]
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
}
const GroupNodes = ({
  edges,
  groups,
  answersCounts,
  onUnlockProPlanClick,
}: Props) => {
  return (
    <EndpointsProvider>
      <Edges
        edges={edges}
        answersCounts={answersCounts}
        onUnlockProPlanClick={onUnlockProPlanClick}
      />
      {groups.map((group, idx) => (
        <GroupNode group={group} groupIndex={idx} key={group.id} />
      ))}
    </EndpointsProvider>
  )
}

export default memo(GroupNodes)
