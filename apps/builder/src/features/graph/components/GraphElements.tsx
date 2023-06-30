import { Edge, Group } from '@typebot.io/schemas'
import { TotalAnswersInBlock } from '@typebot.io/schemas/features/analytics'
import React, { memo } from 'react'
import { EndpointsProvider } from '../providers/EndpointsProvider'
import { Edges } from './edges/Edges'
import { GroupNode } from './nodes/group'

type Props = {
  edges: Edge[]
  groups: Group[]
  totalAnswersInBlocks?: TotalAnswersInBlock[]
  onUnlockProPlanClick?: () => void
}
const GroupNodes = ({
  edges,
  groups,
  totalAnswersInBlocks,
  onUnlockProPlanClick,
}: Props) => {
  return (
    <EndpointsProvider>
      <Edges
        edges={edges}
        totalAnswersInBlocks={totalAnswersInBlocks}
        onUnlockProPlanClick={onUnlockProPlanClick}
      />
      {groups.map((group, idx) => (
        <GroupNode group={group} groupIndex={idx} key={group.id} />
      ))}
    </EndpointsProvider>
  )
}

export default memo(GroupNodes)
