import { Input } from "@typebot.io/ui/components/Input";
import { ArrowUpRight01Icon } from "@typebot.io/ui/icons/ArrowUpRight01Icon";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { useRouter } from "next/router";
import { ButtonLink } from "@/components/ButtonLink";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useTypebots } from "@/features/dashboard/hooks/useTypebots";

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

  if (isLoading) return <Input value="Loading..." disabled />;
  if (!typebots || typebots.length === 0)
    return <Input value="No typebots found" disabled />;
  return (
    <div className="flex items-center gap-2 flex-1">
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
          className="shrink-0"
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
          <ArrowUpRight01Icon />
        </ButtonLink>
      )}
    </div>
  );
};
