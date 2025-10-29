import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { getChatsLimit } from "@typebot.io/billing/helpers/getChatsLimit";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
import { Progress } from "@typebot.io/ui/components/Progress";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import type { WorkspaceInApp } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";

type Props = {
  workspace: WorkspaceInApp;
};

export const UsageProgressBars = ({ workspace }: Props) => {
  const { t } = useTranslate();
  const { data, isLoading } = useQuery(
    trpc.billing.getUsage.queryOptions({
      workspaceId: workspace.id,
    }),
  );
  const totalChatsUsed = data?.totalChatsUsed ?? 0;

  const workspaceChatsLimit = getChatsLimit(workspace);

  const chatsPercentage =
    workspaceChatsLimit === "inf"
      ? 0
      : Math.round((totalChatsUsed / workspaceChatsLimit) * 100);

  return (
    <div className="flex flex-col gap-6">
      <h2>{t("billing.usage.heading")}</h2>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl">{t("billing.usage.chats.heading")}</h3>
            <p className="text-sm italic text-gray-9">
              {t("billing.usage.chats.resetsOn", {
                date: data?.resetsAt.toLocaleDateString(),
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-2 w-5" />
            ) : (
              <p className="font-bold">
                {parseNumberWithCommas(totalChatsUsed)}
              </p>
            )}
            <p>
              /{" "}
              {workspaceChatsLimit === "inf"
                ? t("billing.usage.unlimited")
                : parseNumberWithCommas(workspaceChatsLimit)}
            </p>
          </div>
        </div>

        <Progress.Root value={chatsPercentage} />
      </div>
    </div>
  );
};
