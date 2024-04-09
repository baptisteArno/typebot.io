import { Edge, GroupV6, TEvent } from '@typebot.io/schemas'
import {
  TotalAnswers,
  TotalVisitedEdges,
} from '@typebot.io/schemas/features/analytics'
import React, { memo } from 'react'
import { EndpointsProvider } from '../providers/EndpointsProvider'
import { Edges } from './edges/Edges'
import { GroupNode } from './nodes/group/GroupNode'
import { isInputBlock } from '@typebot.io/schemas/helpers'
import { EventNode } from './nodes/event'

type Props = {
  edges: Edge[]
  groups: GroupV6[]
  events: TEvent[]
  totalVisitedEdges?: TotalVisitedEdges[]
  totalAnswers?: TotalAnswers[]
  onUnlockProPlanClick?: () => void
}
const GroupNodes = ({
  edges,
  groups,
  events,
  totalVisitedEdges,
  totalAnswers,
  onUnlockProPlanClick,
}: Props) => {
  const inputBlockIds = groups
    .flatMap((g) => g.blocks)
    .filter(isInputBlock)
    .map((b) => b.id)

  return (
    <EndpointsProvider>
      <Edges
        edges={edges}
        groups={groups}
        totalAnswers={totalAnswers}
        totalVisitedEdges={totalVisitedEdges}
        inputBlockIds={inputBlockIds}
        onUnlockProPlanClick={onUnlockProPlanClick}
      />
      {events.map((event, idx) => (
        <EventNode event={event} key={event.id} eventIndex={idx} />
      ))}
      {groups.map((group, idx) => (
        <GroupNode group={group} groupIndex={idx} key={group.id} />
      ))}
    </EndpointsProvider>
  )
}

export default memo(GroupNodes)
