import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { TEvent } from "@typebot.io/events/schemas";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import { memo } from "react";
import type {
  EdgeWithTotalVisits,
  TotalAnswers,
} from "@/features/analytics/schemas";
import { EventNode } from "@/features/events/components/EventNode";
import { EndpointsProvider } from "../providers/EndpointsProvider";
import { Edges } from "./edges/Edges";
import { GroupNode } from "./nodes/group/GroupNode";

type Props = {
  edges: Edge[];
  groups: GroupV6[];
  events: TEvent[];
  edgesWithTotalUsers?: EdgeWithTotalVisits[];
  totalAnswers?: TotalAnswers[];
  onUnlockProPlanClick?: () => void;
};
const GroupNodes = ({
  edges,
  groups,
  events,
  edgesWithTotalUsers,
  totalAnswers,
  onUnlockProPlanClick,
}: Props) => {
  const inputBlockIds = groups
    .flatMap((g) => g.blocks)
    .filter(isInputBlock)
    .map((b) => b.id);

  return (
    <EndpointsProvider>
      <Edges
        edges={edges}
        groups={groups}
        totalAnswers={totalAnswers}
        edgesWithTotalUsers={edgesWithTotalUsers}
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
  );
};

export default memo(GroupNodes);
