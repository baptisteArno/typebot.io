import {
  Flex,
  Heading,
  HStack,
  Progress,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { getChatsLimit } from "@typebot.io/billing/helpers/getChatsLimit";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
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
    <Stack spacing={6}>
      <Heading fontSize="3xl">{t("billing.usage.heading")}</Heading>
      <Stack spacing={3}>
        <Flex justifyContent="space-between">
          <HStack>
            <Heading fontSize="xl" as="h3">
              {t("billing.usage.chats.heading")}
            </Heading>
            <Text fontSize="sm" fontStyle="italic" color="gray.500">
              {t("billing.usage.chats.resetsOn", {
                date: data?.resetsAt.toLocaleDateString(),
              })}
            </Text>
          </HStack>

          <HStack>
            <Skeleton
              fontWeight="bold"
              isLoaded={!isLoading}
              h={isLoading ? "5px" : "auto"}
            >
              {parseNumberWithCommas(totalChatsUsed)}
            </Skeleton>
            <Text>
              /{" "}
              {workspaceChatsLimit === "inf"
                ? t("billing.usage.unlimited")
                : parseNumberWithCommas(workspaceChatsLimit)}
            </Text>
          </HStack>
        </Flex>

        <Progress
          h="5px"
          value={chatsPercentage}
          rounded="full"
          isIndeterminate={isLoading}
          colorScheme="orange"
        />
      </Stack>
    </Stack>
  );
};
