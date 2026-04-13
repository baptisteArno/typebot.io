import { Edge, GroupV6, TEvent } from '@typebot.io/schemas'
import type {
  GroupAnalytics,
  BlockIssue,
} from '@/features/analytics/components/AnalyticsGraphContainer'
import React, { memo } from 'react'
import { EndpointsProvider } from '../providers/EndpointsProvider'
import { Edges } from './edges/Edges'
import { GroupNode } from './nodes/group/GroupNode'
import { EventNode } from './nodes/event'
import { GroupAnalyticsBadge, BlockIssueBadge } from './AnalyticsBadges'

type Props = {
  edges: Edge[]
  groups: GroupV6[]
  events: TEvent[]
  groupAnalyticsMap?: Map<string, GroupAnalytics>
  blockIssues?: BlockIssue[]
  onUnlockProPlanClick?: () => void
  highlightedEdges?: Map<string, string>
}
const GroupNodes = ({
  edges,
  groups,
  events,
  groupAnalyticsMap,
  blockIssues,
  onUnlockProPlanClick,
  highlightedEdges,
}: Props) => {
  return (
    <EndpointsProvider>
      <Edges
        edges={edges}
        groups={groups}
        highlightedEdges={highlightedEdges}
      />
      {events.map((event, idx) => (
        <EventNode event={event} key={event.id} eventIndex={idx} />
      ))}
      {groups.map((group, idx) => (
        <React.Fragment key={group.id}>
          <GroupNode group={group} groupIndex={idx} />
          {groupAnalyticsMap && (
            <GroupAnalyticsBadge
              groupId={group.id}
              analytics={groupAnalyticsMap.get(group.id)}
            />
          )}
        </React.Fragment>
      ))}
      {blockIssues?.map((issue) => (
        <BlockIssueBadge key={`${issue.blockId}-${issue.type}`} issue={issue} />
      ))}
    </EndpointsProvider>
  )
}

export default memo(GroupNodes)
