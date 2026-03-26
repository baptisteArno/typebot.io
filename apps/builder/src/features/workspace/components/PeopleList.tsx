import { useMutation, useQuery } from "@tanstack/react-query";
import { createId } from "@typebot.io/lib/createId";
import { SpaceId } from "@typebot.io/shared-core/domain";
import { SpaceName } from "@typebot.io/spaces/domain";
import { Button } from "@typebot.io/ui/components/Button";
import { Tabs } from "@typebot.io/ui/components/Tabs";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { Schema } from "effect";
import { useState } from "react";
import { orpc, queryClient } from "@/lib/queryClient";
import { useWorkspace } from "../WorkspaceProvider";
import { SpacesList } from "./SpacesList";
import { WorkspaceMembersList } from "./WorkspaceMembersList";

const OptimisticSpaceCreate = Schema.Struct({
  id: SpaceId,
  name: SpaceName,
  icon: Schema.Null.pipe(Schema.withDecodingDefault(() => null)),
  createdAt: Schema.DateValid.pipe(
    Schema.withDecodingDefault(() => new Date()),
  ),
});

export const PeopleList = () => {
  const { workspace } = useWorkspace();

  const [currentTab, setCurrentTab] = useState("members");
  const [lastCreatedSpaceId, setLastCreatedSpaceId] = useState<string>();

  const { data: spacesFeatureFlagData } = useQuery(
    orpc.featureFlags.isEnabled.queryOptions({
      input: { key: "spaces" },
    }),
  );
  const { data: membersData, isLoading: isMembersCountLoading } = useQuery(
    orpc.workspace.listMembersInWorkspace.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled: !!workspace?.id,
    }),
  );
  const { data: invitationsData, isLoading: isInvitationsCountLoading } =
    useQuery(
      orpc.workspace.listInvitationsInWorkspace.queryOptions({
        input: { workspaceId: workspace?.id ?? "" },
        enabled: !!workspace?.id,
      }),
    );
  const { data: spacesData, refetch: refetchSpaces } = useQuery(
    orpc.spaces.list.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled:
        spacesFeatureFlagData?.enabled === true &&
        currentTab === "spaces" &&
        !!workspace?.id,
    }),
  );

  const { mutate: createSpace } = useMutation(
    orpc.spaces.create.mutationOptions({
      onMutate: (data) => {
        const result = Schema.decodeUnknownExit(OptimisticSpaceCreate)(data);
        if (result._tag !== "Success") {
          console.error(
            "Failed to decode optimistic space create",
            result.cause,
          );
          return;
        }
        const newSpace = result.value;
        const queryKey = orpc.spaces.list.queryKey({
          input: { workspaceId: data.workspaceId },
        });
        const cacheData = queryClient.getQueryData<typeof spacesData>(queryKey);
        queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData<typeof spacesData>(queryKey, (cache) =>
          cache
            ? { spaces: [newSpace, ...cache.spaces] }
            : {
                spaces: [newSpace],
              },
        );
        return { previousCacheData: cacheData, key: queryKey };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousCacheData) {
          queryClient.setQueryData(context.key, context.previousCacheData);
        }
      },
      onSettled: () => {
        refetchSpaces();
      },
    }),
  );

  const handleCreateSpace = () => {
    if (!workspace?.id) return;
    const id = createId();
    setLastCreatedSpaceId(id);
    createSpace({
      workspaceId: workspace.id,
      id,
      name: "My space",
    });
  };

  const isSpacesTabVisible = spacesFeatureFlagData?.enabled === true;
  const displayedTab =
    !isSpacesTabVisible && currentTab === "spaces" ? "members" : currentTab;
  const membersListedTotal =
    (membersData?.members.length ?? 0) +
    (invitationsData?.invitations.length ?? 0);
  const isMembersTabCountLoading =
    isMembersCountLoading || isInvitationsCountLoading;
  const hasSpaces = (spacesData?.spaces.length ?? 0) > 0;

  return (
    <Tabs.Root value={displayedTab} onValueChange={setCurrentTab}>
      <div className="flex items-center justify-between">
        <Tabs.List>
          <Tabs.Tab value="members">
            Members
            {workspace?.id ? (
              <span className="text-muted-foreground tabular-nums">
                {isMembersTabCountLoading ? "…" : membersListedTotal}
              </span>
            ) : null}
          </Tabs.Tab>
          {isSpacesTabVisible && <Tabs.Tab value="spaces">Spaces</Tabs.Tab>}
        </Tabs.List>
        {isSpacesTabVisible && displayedTab === "spaces" && hasSpaces && (
          <Button size="sm" onClick={handleCreateSpace}>
            <PlusSignIcon />
            Create
          </Button>
        )}
      </div>
      <Tabs.Panel value="members">
        <WorkspaceMembersList />
      </Tabs.Panel>
      {isSpacesTabVisible && (
        <Tabs.Panel value="spaces">
          <SpacesList
            isEnabled={displayedTab === "spaces"}
            lastCreatedSpaceId={lastCreatedSpaceId}
            onCreateClick={handleCreateSpace}
          />
        </Tabs.Panel>
      )}
    </Tabs.Root>
  );
};
