import { Flex, HStack, Tag, Text, useColorModeValue } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { Seo } from "@/components/Seo";
import { AnalyticsGraphContainer } from "@/features/analytics/components/AnalyticsGraphContainer";
import {
  defaultTimeFilter,
  timeFilterValues,
} from "@/features/analytics/constants";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { ResultsProvider } from "../ResultsProvider";
import { ResultsTableContainer } from "./ResultsTableContainer";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const ResultsPage = () => {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const { typebot, publishedTypebot } = useTypebot();
  const isAnalytics = useMemo(
    () => router.pathname.endsWith("analytics"),
    [router.pathname],
  );
  const bgColor = useColorModeValue("white", "gray.950");
  const [timeFilter, setTimeFilter] = useQueryState<
    (typeof timeFilterValues)[number]
  >("timeFilter", {
    defaultValue: defaultTimeFilter,
    parse: (val) => {
      if (timeFilterValues.includes(val as (typeof timeFilterValues)[number]))
        return val as (typeof timeFilterValues)[number];
      return null;
    },
  });

  const { data: { stats } = {}, refetch } = useQuery(
    trpc.analytics.getStats.queryOptions(
      {
        typebotId: publishedTypebot?.typebotId as string,
        timeFilter,
        timeZone,
      },
      {
        enabled: !!publishedTypebot,
      },
    ),
  );

  const handleDeletedResults = () => {
    if (!stats) return;
    refetch();
  };

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo
        title={
          router.pathname.endsWith("analytics")
            ? typebot?.name
              ? `${typebot.name} | Analytics`
              : "Analytics"
            : typebot?.name
              ? `${typebot.name} | Results`
              : "Results"
        }
      />
      <TypebotHeader />
      <Flex h="full" w="full" bgColor={bgColor}>
        <Flex
          pos="absolute"
          w="full"
          justifyContent="center"
          h="60px"
          display={["none", "flex"]}
        >
          <HStack maxW="1600px" w="full" px="4">
            <ButtonLink
              variant={!isAnalytics ? "outline" : "ghost"}
              size="sm"
              href={{
                pathname: "/typebots/[typebotId]/results",
                query: {
                  typebotId: publishedTypebot?.typebotId,
                  timeFilter:
                    timeFilter && timeFilter !== defaultTimeFilter
                      ? timeFilter
                      : undefined,
                },
              }}
            >
              <Text>Submissions</Text>
              {(stats?.totalStarts ?? 0) > 0 && (
                <Tag size="sm" colorScheme="orange" ml="1">
                  {stats?.totalStarts}
                </Tag>
              )}
            </ButtonLink>
            <ButtonLink
              variant={isAnalytics ? "outline" : "ghost"}
              href={{
                pathname: "/typebots/[typebotId]/results/analytics",
                query: {
                  typebotId: publishedTypebot?.typebotId,
                  timeFilter:
                    timeFilter && timeFilter !== defaultTimeFilter
                      ? timeFilter
                      : undefined,
                },
              }}
              size="sm"
            >
              Analytics
            </ButtonLink>
          </HStack>
        </Flex>
        <Flex pt={["10px", "60px"]} w="full" justify="center">
          {workspace &&
            publishedTypebot &&
            (isAnalytics ? (
              <AnalyticsGraphContainer
                stats={stats}
                timeFilter={timeFilter}
                onTimeFilterChange={setTimeFilter}
              />
            ) : (
              <ResultsProvider
                timeFilter={timeFilter}
                typebotId={publishedTypebot.typebotId}
                totalResults={stats?.totalStarts ?? 0}
                onDeleteResults={handleDeletedResults}
              >
                <ResultsTableContainer
                  timeFilter={timeFilter}
                  onTimeFilterChange={setTimeFilter}
                />
              </ResultsProvider>
            ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
