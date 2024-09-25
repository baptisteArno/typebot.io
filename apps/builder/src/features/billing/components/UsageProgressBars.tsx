import { AlertIcon } from "@/components/icons";
import type { WorkspaceInApp } from "@/features/workspace/WorkspaceProvider";
import { defaultQueryOptions, trpc } from "@/lib/trpc";
import {
  Flex,
  HStack,
  Heading,
  Progress,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { getChatsLimit } from "@typebot.io/billing/helpers/getChatsLimit";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";

type Props = {
  workspace: WorkspaceInApp;
};

export const UsageProgressBars = ({ workspace }: Props) => {
  const { t } = useTranslate();
  const { data, isLoading } = trpc.billing.getUsage.useQuery(
    {
      workspaceId: workspace.id,
    },
    defaultQueryOptions,
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
            {chatsPercentage >= 80 && (
              <Tooltip
                placement="top"
                rounded="md"
                p="3"
                label={
                  <Text>
                    {t("billing.usage.chats.alert.soonReach")}
                    <br />
                    <br />
                    {t("billing.usage.chats.alert.updatePlan")}
                  </Text>
                }
              >
                <span>
                  <AlertIcon color="orange.500" />
                </span>
              </Tooltip>
            )}
            <Text fontSize="sm" fontStyle="italic" color="gray.500">
              (Resets on {data?.resetsAt.toLocaleDateString()})
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
          colorScheme={"blue"}
        />
      </Stack>
    </Stack>
  );
};
