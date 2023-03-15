import { AnswersCount } from '@/features/analytics'
import { Edge, Group } from '@typebot.io/schemas'
import React, { memo } from 'react'
import { EndpointsProvider } from '../providers/EndpointsProvider'
import { Edges } from './Edges'
import { GroupNode } from './Nodes/GroupNode'

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
