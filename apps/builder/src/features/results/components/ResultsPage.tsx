import { useQuery } from "@tanstack/react-query";
import { Badge } from "@typebot.io/ui/components/Badge";
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
    <div className="flex overflow-hidden h-screen flex-col">
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
      <div className="flex h-full w-full bg-gray-1">
        <div className="absolute w-full justify-center h-[60px] hidden sm:flex">
          <div className="flex items-center gap-2 max-w-[1600px] w-full px-4">
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
              <p>Submissions</p>
              {(stats?.totalStarts ?? 0) > 0 && (
                <Badge colorScheme="orange" className="ml-1">
                  {stats?.totalStarts}
                </Badge>
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
          </div>
        </div>
        <div className="flex w-full justify-center pt-[10px] sm:pt-[60px]">
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
        </div>
      </div>
    </div>
  );
};
