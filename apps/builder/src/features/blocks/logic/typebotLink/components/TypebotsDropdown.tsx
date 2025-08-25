import { ButtonLink } from "@/components/ButtonLink";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { ExternalLinkIcon } from "@/components/icons";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useTypebots } from "@/features/dashboard/hooks/useTypebots";
import { HStack, Input } from "@chakra-ui/react";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { useRouter } from "next/router";

type Props = {
  idsToExclude: string[];
  typebotId?: string | "current";
  currentWorkspaceId: string;
  onSelect: (typebotId: string | "current" | undefined) => void;
};

export const TypebotsDropdown = ({
  idsToExclude,
  typebotId,
  onSelect,
  currentWorkspaceId,
}: Props) => {
  const { query } = useRouter();
  const { typebots, isLoading } = useTypebots({
    workspaceId: currentWorkspaceId,
  });

  if (isLoading) return <Input value="Loading..." isDisabled />;
  if (!typebots || typebots.length === 0)
    return <Input value="No typebots found" isDisabled />;
  return (
    <HStack flex={1}>
      <BasicSelect
        value={typebotId}
        className="w-full"
        items={[
          {
            label: "Current typebot",
            value: "current",
          },
          ...(typebots ?? [])
            .filter((typebot) => !idsToExclude.includes(typebot.id))
            .map((typebot) => ({
              icon: (
                <EmojiOrImageIcon
                  icon={typebot.icon}
                  size="sm"
                  defaultIcon={LayoutBottomIcon}
                />
              ),
              label: typebot.name,
              value: typebot.id,
            })),
        ]}
        onChange={onSelect}
        placeholder={"Select a typebot"}
      />
      {typebotId && typebotId !== "current" && (
        <ButtonLink
          aria-label="Navigate to typebot"
          variant="secondary"
          className="flex-shrink-0"
          size="icon"
          href={{
            pathname: "/typebots/[typebotId]/edit",
            query: {
              typebotId,
              parentId: query.parentId
                ? Array.isArray(query.parentId)
                  ? query.parentId.concat(query.typebotId?.toString() ?? "")
                  : [query.parentId, query.typebotId?.toString() ?? ""]
                : (query.typebotId ?? []),
            },
          }}
        >
          <ExternalLinkIcon />
        </ButtonLink>
      )}
    </HStack>
  );
};
