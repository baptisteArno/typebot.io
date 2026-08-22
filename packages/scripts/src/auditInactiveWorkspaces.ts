import { writeFile } from "node:fs/promises";
import prisma from "@typebot.io/prisma/withReadReplica";
import { Effect } from "effect";
import { assertProductionEnvironment, getCliOption, runScript } from "./cli";

export const auditInactiveWorkspaces = Effect.fn("auditInactiveWorkspaces")(
  function* () {
    const args = process.argv.slice(2);
    const inactivityMonths = getBoundedPositiveIntegerOption({
      args,
      name: "inactivity-months",
      fallback: 12,
      maximum: 120,
    });
    const workspacePageSize = getBoundedPositiveIntegerOption({
      args,
      name: "workspace-page-size",
      fallback: 200,
      maximum: 1_000,
    });
    const typebotBatchSize = getBoundedPositiveIntegerOption({
      args,
      name: "typebot-batch-size",
      fallback: 100,
      maximum: 500,
    });
    const topCandidatesLimit = getBoundedPositiveIntegerOption({
      args,
      name: "top-candidates",
      fallback: 20,
      maximum: 100,
    });
    const maxWorkspacePages = getOptionalBoundedPositiveIntegerOption({
      args,
      name: "max-workspace-pages",
      maximum: 10_000,
    });
    const startAfterWorkspaceIdOption = getCliOption(
      args,
      "start-after-workspace-id",
    );
    if (
      startAfterWorkspaceIdOption !== undefined &&
      (typeof startAfterWorkspaceIdOption !== "string" ||
        startAfterWorkspaceIdOption.length === 0)
    )
      throw new Error("--start-after-workspace-id requires a workspace ID");
    const referenceDateOption = getCliOption(args, "reference-date");
    if (
      referenceDateOption !== undefined &&
      typeof referenceDateOption !== "string"
    )
      throw new Error("--reference-date requires an ISO date");
    const generatedAt = referenceDateOption
      ? new Date(referenceDateOption)
      : new Date();
    if (Number.isNaN(generatedAt.getTime()))
      throw new Error("--reference-date requires a valid ISO date");
    const outputOption = getCliOption(args, "output");
    if (outputOption !== undefined && typeof outputOption !== "string")
      throw new Error("--output requires a file path");

    const replica = yield* Effect.try({
      try: () => prisma.$replica(),
      catch: (cause) =>
        new Error("Could not select the read replica", { cause }),
    });
    const inactivityCutoff = subtractUtcMonths(generatedAt, inactivityMonths);
    const activityAgeCutoffs = {
      threeMonthsAgo: subtractUtcMonths(generatedAt, 3),
      sixMonthsAgo: subtractUtcMonths(generatedAt, 6),
      twelveMonthsAgo: subtractUtcMonths(generatedAt, 12),
      twentyFourMonthsAgo: subtractUtcMonths(generatedAt, 24),
    };
    const resultAgeCutoffs = {
      thirtyDaysAgo: subtractUtcDays(generatedAt, 30),
      ninetyDaysAgo: subtractUtcDays(generatedAt, 90),
      oneHundredEightyDaysAgo: subtractUtcDays(generatedAt, 180),
      oneYearAgo: subtractUtcMonths(generatedAt, 12),
      twoYearsAgo: subtractUtcMonths(generatedAt, 24),
    };

    yield* logProgress(
      `Reading table storage metadata from the replica. Inactivity cutoff: ${inactivityCutoff.toISOString()}.`,
    );
    const tableStorageRows = yield* runPromiseTask(
      "read table storage metadata",
      () =>
        replica.$queryRaw<TableStorageRow[]>`
          SELECT
            CAST(TABLE_NAME AS CHAR CHARACTER SET utf8mb4) tableName,
            CAST(COALESCE(TABLE_ROWS, 0) AS CHAR) tableRows,
            CAST(COALESCE(DATA_LENGTH, 0) AS CHAR) dataBytes,
            CAST(COALESCE(INDEX_LENGTH, 0) AS CHAR) indexBytes
          FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_TYPE = 'BASE TABLE'
        `,
    );
    const tableStorage = tableStorageRows
      .map((row) => {
        const dataBytes = parseNonNegativeNumber(row.dataBytes, row.tableName);
        const indexBytes = parseNonNegativeNumber(
          row.indexBytes,
          row.tableName,
        );
        const totalBytes = dataBytes + indexBytes;
        return {
          name: row.tableName,
          approximateRows: parseNonNegativeNumber(row.tableRows, row.tableName),
          dataBytes,
          indexBytes,
          totalBytes,
          totalGiB: toGiB(totalBytes),
        };
      })
      .sort((left, right) => right.totalBytes - left.totalBytes);
    const tableStorageByName = new Map(
      tableStorage.map((table) => [table.name, table]),
    );
    const workspaceFamilyAverageBytes = getFamilyAverageBytes({
      tableStorageByName,
      parentTableName: "Workspace",
      familyTableNames: [
        "Workspace",
        "MemberInWorkspace",
        "WorkspaceInvitation",
        "CustomDomain",
        "Credentials",
        "DashboardFolder",
        "ClaimableCustomPlan",
        "ThemeTemplate",
        "Space",
      ],
    });
    const typebotFamilyAverageBytes = getFamilyAverageBytes({
      tableStorageByName,
      parentTableName: "Typebot",
      familyTableNames: [
        "Typebot",
        "Invitation",
        "CollaboratorsOnTypebots",
        "PublicTypebot",
        "RuntimeMediaIdCache",
        "Webhook",
      ],
    });
    const resultFamilyAverageBytes = getFamilyAverageBytes({
      tableStorageByName,
      parentTableName: "Result",
      familyTableNames: [
        "Result",
        "SetVariableHistoryItem",
        "VisitedEdge",
        "Log",
        "Answer",
        "AnswerV2",
      ],
    });
    const resultOnlyAverageBytes = getTableAverageBytes(
      tableStorageByName.get("Result"),
    );

    let totalWorkspaces = 0;
    let totalTypebots = 0;
    let freeWorkspacesWithoutStripe = 0;
    let inactiveByMetadata = 0;
    let provisionalCandidates = 0;
    let eligibleWorkspaces = 0;
    let eligibleTypebots = 0;
    let eligibleResults = 0;
    let eligibleArchivedResults = 0;
    let eligibleUnarchivedResults = 0;
    let eligibleWorkspacesWithoutTypebots = 0;
    let eligibleWorkspacesWithoutResults = 0;
    const activityAgeBeforeResultVerification = {
      activeWithinThreeMonths: 0,
      inactiveThreeToSixMonths: 0,
      inactiveSixToTwelveMonths: 0,
      inactiveTwelveToTwentyFourMonths: 0,
      inactiveAtLeastTwentyFourMonths: 0,
    };
    const exclusionsNotMutuallyExclusive = {
      paidPlanOrStripeCustomer: 0,
      quarantinedSuspendedOrPastDue: 0,
      createdAfterCutoff: 0,
      recentWorkspaceActivity: 0,
      recentMemberAccountActivity: 0,
      recentTypebotUpdate: 0,
      recentPublicTypebotTraffic: 0,
      recentResult: 0,
    };
    const topCandidates: CandidateSummary[] = [];
    const resultRetentionBySegment = new Map<string, ResultRetentionSegment>();
    let lastWorkspaceId = startAfterWorkspaceIdOption;
    let pageNumber = 0;
    let stoppedAtPageLimit = false;

    while (true) {
      const workspacePage = yield* runPromiseTask(
        `read workspace page ${pageNumber + 1}`,
        () =>
          replica.workspace.findMany({
            where: lastWorkspaceId
              ? {
                  id: {
                    gt: lastWorkspaceId,
                  },
                }
              : undefined,
            orderBy: {
              id: "asc",
            },
            take: workspacePageSize,
            select: {
              id: true,
              createdAt: true,
              lastActivityAt: true,
              plan: true,
              stripeId: true,
              isQuarantined: true,
              isSuspended: true,
              isPastDue: true,
            },
          }),
      );
      if (workspacePage.length === 0) break;

      pageNumber += 1;
      totalWorkspaces += workspacePage.length;
      const workspaceIds = workspacePage.map((workspace) => workspace.id);
      const [members, typebots] = yield* Effect.all([
        runPromiseTask(`read members for workspace page ${pageNumber}`, () =>
          replica.memberInWorkspace.findMany({
            where: {
              workspaceId: {
                in: workspaceIds,
              },
            },
            select: {
              workspaceId: true,
              user: {
                select: {
                  lastActivityAt: true,
                },
              },
            },
          }),
        ),
        runPromiseTask(`read typebots for workspace page ${pageNumber}`, () =>
          replica.typebot.findMany({
            where: {
              workspaceId: {
                in: workspaceIds,
              },
            },
            select: {
              id: true,
              workspaceId: true,
              updatedAt: true,
              publishedTypebot: {
                select: {
                  lastActivityAt: true,
                },
              },
            },
          }),
        ),
      ]);
      totalTypebots += typebots.length;

      const latestMemberActivityByWorkspaceId = new Map<string, Date>();
      for (const member of members)
        keepLatestDate(
          latestMemberActivityByWorkspaceId,
          member.workspaceId,
          member.user.lastActivityAt,
        );

      const typebotIdsByWorkspaceId = new Map<string, string[]>();
      const latestTypebotUpdateByWorkspaceId = new Map<string, Date>();
      const latestPublicTrafficByWorkspaceId = new Map<string, Date>();
      for (const typebot of typebots) {
        const workspaceTypebotIds =
          typebotIdsByWorkspaceId.get(typebot.workspaceId) ?? [];
        workspaceTypebotIds.push(typebot.id);
        typebotIdsByWorkspaceId.set(typebot.workspaceId, workspaceTypebotIds);
        keepLatestDate(
          latestTypebotUpdateByWorkspaceId,
          typebot.workspaceId,
          typebot.updatedAt,
        );
        if (typebot.publishedTypebot?.lastActivityAt)
          keepLatestDate(
            latestPublicTrafficByWorkspaceId,
            typebot.workspaceId,
            typebot.publishedTypebot.lastActivityAt,
          );
      }

      const pageCandidates: ProvisionalCandidate[] = [];
      const resultRetentionContextByWorkspaceId = new Map<
        string,
        ResultRetentionContext
      >();
      for (const workspace of workspacePage) {
        const latestMemberActivityAt = latestMemberActivityByWorkspaceId.get(
          workspace.id,
        );
        const latestTypebotUpdateAt = latestTypebotUpdateByWorkspaceId.get(
          workspace.id,
        );
        const latestPublicTrafficAt = latestPublicTrafficByWorkspaceId.get(
          workspace.id,
        );
        const latestMetadataActivityAt = getLatestDate(
          workspace.createdAt,
          workspace.lastActivityAt,
          latestMemberActivityAt,
          latestTypebotUpdateAt,
          latestPublicTrafficAt,
        );

        if (latestMetadataActivityAt > activityAgeCutoffs.threeMonthsAgo)
          activityAgeBeforeResultVerification.activeWithinThreeMonths += 1;
        else if (latestMetadataActivityAt > activityAgeCutoffs.sixMonthsAgo)
          activityAgeBeforeResultVerification.inactiveThreeToSixMonths += 1;
        else if (latestMetadataActivityAt > activityAgeCutoffs.twelveMonthsAgo)
          activityAgeBeforeResultVerification.inactiveSixToTwelveMonths += 1;
        else if (
          latestMetadataActivityAt > activityAgeCutoffs.twentyFourMonthsAgo
        )
          activityAgeBeforeResultVerification.inactiveTwelveToTwentyFourMonths += 1;
        else
          activityAgeBeforeResultVerification.inactiveAtLeastTwentyFourMonths += 1;

        const isFreeWithoutStripe =
          workspace.plan === "FREE" && workspace.stripeId === null;
        if (isFreeWithoutStripe) freeWorkspacesWithoutStripe += 1;
        else exclusionsNotMutuallyExclusive.paidPlanOrStripeCustomer += 1;

        const hasSpecialStatus =
          workspace.isQuarantined ||
          workspace.isSuspended ||
          workspace.isPastDue;
        if (hasSpecialStatus)
          exclusionsNotMutuallyExclusive.quarantinedSuspendedOrPastDue += 1;
        if (workspace.createdAt > inactivityCutoff)
          exclusionsNotMutuallyExclusive.createdAfterCutoff += 1;
        if (
          workspace.lastActivityAt &&
          workspace.lastActivityAt > inactivityCutoff
        )
          exclusionsNotMutuallyExclusive.recentWorkspaceActivity += 1;
        if (latestMemberActivityAt && latestMemberActivityAt > inactivityCutoff)
          exclusionsNotMutuallyExclusive.recentMemberAccountActivity += 1;
        if (latestTypebotUpdateAt && latestTypebotUpdateAt > inactivityCutoff)
          exclusionsNotMutuallyExclusive.recentTypebotUpdate += 1;
        if (latestPublicTrafficAt && latestPublicTrafficAt > inactivityCutoff)
          exclusionsNotMutuallyExclusive.recentPublicTypebotTraffic += 1;

        const isInactiveByMetadata =
          latestMetadataActivityAt <= inactivityCutoff;
        if (isInactiveByMetadata) inactiveByMetadata += 1;
        resultRetentionContextByWorkspaceId.set(workspace.id, {
          billingGroup: isFreeWithoutStripe
            ? "freeWithoutStripe"
            : "paidPlanOrStripeCustomer",
          hasProtectedStatus: hasSpecialStatus,
          workspaceMetadataActivity: isInactiveByMetadata
            ? "inactiveAtLeastCutoff"
            : "activeAfterCutoff",
        });
        if (!isFreeWithoutStripe || hasSpecialStatus || !isInactiveByMetadata)
          continue;

        provisionalCandidates += 1;
        pageCandidates.push({
          id: workspace.id,
          latestMetadataActivityAt,
          typebotIds: typebotIdsByWorkspaceId.get(workspace.id) ?? [],
        });
      }

      const resultUsageByTypebotId = new Map<string, ResultUsage>();
      const resultRetentionContextByTypebotId = new Map<
        string,
        ResultRetentionContext
      >();
      for (const typebot of typebots) {
        const resultRetentionContext = resultRetentionContextByWorkspaceId.get(
          typebot.workspaceId,
        );
        if (!resultRetentionContext)
          throw new Error(
            `Missing result retention context for workspace ${typebot.workspaceId}`,
          );
        resultRetentionContextByTypebotId.set(
          typebot.id,
          resultRetentionContext,
        );
      }

      const allTypebotIds = typebots.map((typebot) => typebot.id);
      for (
        let index = 0;
        index < allTypebotIds.length;
        index += typebotBatchSize
      ) {
        const typebotIds = allTypebotIds.slice(index, index + typebotBatchSize);
        const typebotPlaceholders = typebotIds.map(() => "?").join(", ");
        const resultGroups = yield* runPromiseTask(
          `audit result retention for workspace page ${pageNumber}, typebot batch ${Math.floor(index / typebotBatchSize) + 1}`,
          () =>
            replica.$queryRawUnsafe<ResultRetentionRow[]>(
              `SELECT
                typebotId,
                CASE
                  WHEN createdAt > ? THEN 'underThirtyDays'
                  WHEN createdAt > ? THEN 'thirtyToNinetyDays'
                  WHEN createdAt > ? THEN 'ninetyToOneHundredEightyDays'
                  WHEN createdAt > ? THEN 'oneHundredEightyDaysToOneYear'
                  WHEN createdAt > ? THEN 'oneToTwoYears'
                  ELSE 'atLeastTwoYears'
                END ageBucket,
                IF(isArchived = TRUE, '1', '0') archived,
                CAST(COUNT(*) AS CHAR) resultCount,
                MAX(createdAt) latestCreatedAt
              FROM Result
              WHERE typebotId IN (${typebotPlaceholders})
              GROUP BY typebotId, ageBucket, archived`,
              resultAgeCutoffs.thirtyDaysAgo,
              resultAgeCutoffs.ninetyDaysAgo,
              resultAgeCutoffs.oneHundredEightyDaysAgo,
              resultAgeCutoffs.oneYearAgo,
              resultAgeCutoffs.twoYearsAgo,
              ...typebotIds,
            ),
        );
        for (const resultGroup of resultGroups) {
          const ageBucket = parseResultAgeBucket(resultGroup.ageBucket);
          const isArchived = parseArchivedFlag(resultGroup.archived);
          const resultCount = parseNonNegativeNumber(
            resultGroup.resultCount,
            "Result retention group",
          );
          const resultRetentionContext = resultRetentionContextByTypebotId.get(
            resultGroup.typebotId,
          );
          if (!resultRetentionContext)
            throw new Error(
              `Missing result retention context for typebot ${resultGroup.typebotId}`,
            );

          addResultRetentionSegment(resultRetentionBySegment, {
            ...resultRetentionContext,
            ageBucket,
            isArchived,
            resultCount,
          });

          const resultUsage = resultUsageByTypebotId.get(
            resultGroup.typebotId,
          ) ?? {
            count: 0,
            archivedCount: 0,
            unarchivedCount: 0,
            latestCreatedAt: null,
          };
          resultUsage.count += resultCount;
          if (isArchived) resultUsage.archivedCount += resultCount;
          else resultUsage.unarchivedCount += resultCount;
          if (
            resultGroup.latestCreatedAt &&
            (!resultUsage.latestCreatedAt ||
              resultGroup.latestCreatedAt > resultUsage.latestCreatedAt)
          )
            resultUsage.latestCreatedAt = resultGroup.latestCreatedAt;
          resultUsageByTypebotId.set(resultGroup.typebotId, resultUsage);
        }
      }

      for (const workspace of pageCandidates) {
        let resultCount = 0;
        let archivedResultCount = 0;
        let unarchivedResultCount = 0;
        let latestResultAt: Date | undefined;
        for (const typebotId of workspace.typebotIds) {
          const resultUsage = resultUsageByTypebotId.get(typebotId);
          if (!resultUsage) continue;
          resultCount += resultUsage.count;
          archivedResultCount += resultUsage.archivedCount;
          unarchivedResultCount += resultUsage.unarchivedCount;
          if (resultUsage.latestCreatedAt)
            latestResultAt = getLatestDate(
              resultUsage.latestCreatedAt,
              latestResultAt,
            );
        }
        if (latestResultAt && latestResultAt > inactivityCutoff) {
          exclusionsNotMutuallyExclusive.recentResult += 1;
          continue;
        }

        eligibleWorkspaces += 1;
        eligibleTypebots += workspace.typebotIds.length;
        eligibleResults += resultCount;
        eligibleArchivedResults += archivedResultCount;
        eligibleUnarchivedResults += unarchivedResultCount;
        if (workspace.typebotIds.length === 0)
          eligibleWorkspacesWithoutTypebots += 1;
        if (resultCount === 0) eligibleWorkspacesWithoutResults += 1;

        topCandidates.push({
          workspaceId: workspace.id,
          latestActivityAt: getLatestDate(
            workspace.latestMetadataActivityAt,
            latestResultAt,
          ).toISOString(),
          typebotCount: workspace.typebotIds.length,
          resultCount,
          archivedResultCount,
          unarchivedResultCount,
        });
        topCandidates.sort(
          (left, right) =>
            right.resultCount - left.resultCount ||
            right.typebotCount - left.typebotCount,
        );
        if (topCandidates.length > topCandidatesLimit)
          topCandidates.length = topCandidatesLimit;
      }

      lastWorkspaceId = workspacePage.at(-1)?.id;
      if (
        pageNumber === 1 ||
        pageNumber % 10 === 0 ||
        workspacePage.length < workspacePageSize
      )
        yield* logProgress(
          `Page ${pageNumber}: scanned ${totalWorkspaces} workspaces; ${eligibleWorkspaces} eligible after result verification.`,
        );
      if (workspacePage.length < workspacePageSize) break;
      if (maxWorkspacePages && pageNumber >= maxWorkspacePages) {
        stoppedAtPageLimit = true;
        break;
      }
    }

    const resultRetentionSegments = [...resultRetentionBySegment.values()].sort(
      compareResultRetentionSegments,
    );
    const hasCompleteCoverage =
      startAfterWorkspaceIdOption === undefined && !stoppedAtPageLimit;
    const auditedResultCount = resultRetentionSegments.reduce(
      (total, segment) => total + segment.resultCount,
      0,
    );
    const auditedWorkspaceAverageBytes = getAuditedAverageBytes(
      workspaceFamilyAverageBytes,
      hasCompleteCoverage ? totalWorkspaces : null,
    );
    const auditedTypebotAverageBytes = getAuditedAverageBytes(
      typebotFamilyAverageBytes,
      hasCompleteCoverage ? totalTypebots : null,
    );
    const auditedResultAverageBytes = getAuditedAverageBytes(
      resultFamilyAverageBytes,
      hasCompleteCoverage ? auditedResultCount : null,
    );
    const auditedResultOnlyAverageBytes = getAuditedAverageBytes(
      resultOnlyAverageBytes,
      hasCompleteCoverage ? auditedResultCount : null,
    );
    const estimatedReclaimBytes = getEstimatedReclaimBytes({
      workspaceCount: eligibleWorkspaces,
      typebotCount: eligibleTypebots,
      archivedResultCount: eligibleArchivedResults,
      unarchivedResultCount: eligibleUnarchivedResults,
      workspaceAverageBytes: auditedWorkspaceAverageBytes,
      typebotAverageBytes: auditedTypebotAverageBytes,
      resultAverageBytes: auditedResultAverageBytes,
      resultOnlyAverageBytes: auditedResultOnlyAverageBytes,
    });
    const topCandidatesByEstimatedReclaim = topCandidates.map((candidate) => {
      const candidateEstimatedReclaimBytes = getEstimatedReclaimBytes({
        workspaceCount: 1,
        typebotCount: candidate.typebotCount,
        archivedResultCount: candidate.archivedResultCount,
        unarchivedResultCount: candidate.unarchivedResultCount,
        workspaceAverageBytes: auditedWorkspaceAverageBytes,
        typebotAverageBytes: auditedTypebotAverageBytes,
        resultAverageBytes: auditedResultAverageBytes,
        resultOnlyAverageBytes: auditedResultOnlyAverageBytes,
      });
      return {
        ...candidate,
        estimatedReclaimGiB:
          candidateEstimatedReclaimBytes === null
            ? null
            : toGiB(candidateEstimatedReclaimBytes),
      };
    });
    const resultRetentionScenarios = [
      getResultRetentionScenario({
        name: "allResults",
        segments: resultRetentionSegments,
        resultFamilyAverageBytes: auditedResultAverageBytes,
        resultOnlyAverageBytes: auditedResultOnlyAverageBytes,
      }),
      ...[90, 180, 365, 730].map((minimumAgeDays) =>
        getResultRetentionScenario({
          name: `freeRegularOlderThan${minimumAgeDays}Days`,
          segments: resultRetentionSegments.filter(
            (segment) =>
              segment.billingGroup === "freeWithoutStripe" &&
              !segment.hasProtectedStatus &&
              getResultAgeMinimumDays(segment.ageBucket) >= minimumAgeDays,
          ),
          resultFamilyAverageBytes: auditedResultAverageBytes,
          resultOnlyAverageBytes: auditedResultOnlyAverageBytes,
        }),
      ),
      getResultRetentionScenario({
        name: "archivedOlderThan90DaysAllPlans",
        segments: resultRetentionSegments.filter(
          (segment) =>
            segment.isArchived &&
            getResultAgeMinimumDays(segment.ageBucket) >= 90,
        ),
        resultFamilyAverageBytes: auditedResultAverageBytes,
        resultOnlyAverageBytes: auditedResultOnlyAverageBytes,
      }),
      getResultRetentionScenario({
        name: "paidOrStripeOlderThanOneYear",
        segments: resultRetentionSegments.filter(
          (segment) =>
            segment.billingGroup === "paidPlanOrStripeCustomer" &&
            getResultAgeMinimumDays(segment.ageBucket) >= 365,
        ),
        resultFamilyAverageBytes: auditedResultAverageBytes,
        resultOnlyAverageBytes: auditedResultOnlyAverageBytes,
      }),
    ];
    const totalDatabaseBytes = tableStorage.reduce(
      (total, table) => total + table.totalBytes,
      0,
    );
    const report = {
      version: 2,
      generatedAt: generatedAt.toISOString(),
      configuration: {
        inactivityMonths,
        inactivityCutoff: inactivityCutoff.toISOString(),
        resultAgeCutoffs: Object.fromEntries(
          Object.entries(resultAgeCutoffs).map(([name, date]) => [
            name,
            date.toISOString(),
          ]),
        ),
        workspacePageSize,
        typebotBatchSize,
        maxWorkspacePages: maxWorkspacePages ?? null,
        startAfterWorkspaceId: startAfterWorkspaceIdOption ?? null,
        referenceDate: generatedAt.toISOString(),
      },
      coverage: {
        complete: hasCompleteCoverage,
        reachedEndOfWorkspaceTable: !stoppedAtPageLimit,
        pagesScanned: pageNumber,
        workspacesScanned: totalWorkspaces,
        typebotsScanned: totalTypebots,
        resultsScanned: auditedResultCount,
        nextStartAfterWorkspaceId: stoppedAtPageLimit
          ? (lastWorkspaceId ?? null)
          : null,
      },
      safety: {
        readOnly: true,
        replicaForced: true,
        databaseWritesPerformed: 0,
      },
      storage: {
        totalDatabaseBytes,
        totalDatabaseGiB: toGiB(totalDatabaseBytes),
        largestTables: tableStorage.slice(0, 20),
        informationSchemaFamilyMetrics: {
          workspace: workspaceFamilyAverageBytes,
          typebot: typebotFamilyAverageBytes,
          result: resultFamilyAverageBytes,
          resultOnly: resultOnlyAverageBytes,
        },
        auditedAverageBytes: {
          workspace: auditedWorkspaceAverageBytes,
          typebot: auditedTypebotAverageBytes,
          result: auditedResultAverageBytes,
          resultOnly: auditedResultOnlyAverageBytes,
        },
        eligibleEstimatedReclaimBytes: estimatedReclaimBytes,
        eligibleEstimatedReclaimGiB:
          estimatedReclaimBytes === null ? null : toGiB(estimatedReclaimBytes),
      },
      workspaces: {
        total: totalWorkspaces,
        activityAgeBeforeResultVerification,
        funnel: {
          freeWithoutStripe: freeWorkspacesWithoutStripe,
          inactiveByMetadata,
          provisionalCandidates,
          eligibleAfterResultVerification: eligibleWorkspaces,
          eligibleWithoutTypebots: eligibleWorkspacesWithoutTypebots,
          eligibleWithoutResults: eligibleWorkspacesWithoutResults,
        },
        exclusionsNotMutuallyExclusive,
      },
      eligibleUsage: {
        workspaceCount: eligibleWorkspaces,
        typebotCount: eligibleTypebots,
        resultCount: eligibleResults,
        archivedResultCount: eligibleArchivedResults,
        unarchivedResultCount: eligibleUnarchivedResults,
        topCandidatesByEstimatedReclaim,
      },
      resultRetention: {
        segmentDimensions: [
          "ageBucket",
          "archived status",
          "free-without-Stripe versus paid-or-Stripe",
          "protected workspace status",
          "workspace metadata activity excluding results",
        ],
        segments: resultRetentionSegments,
        scenarios: resultRetentionScenarios,
      },
      methodology: {
        activitySignals: [
          "workspace creation and last activity",
          "latest account activity of every workspace member",
          "latest typebot update",
          "latest public typebot traffic",
          "latest result creation",
        ],
        eligibility:
          "FREE plan, no Stripe customer, no quarantine/suspension/past-due status, and every activity signal at or before the cutoff",
        storageEstimate:
          "Storage totals come from information_schema, but bytes-per-parent denominators come only from exact counts produced by a complete audit. Partial-window reports leave storage estimates null. Unarchived results use the full result family; archived results use Result only because the archive workflow removes dependent rows.",
        caveats: [
          "The audit reads a live replica and is not a transactionally consistent snapshot.",
          "information_schema TABLE_ROWS is deliberately not used for bytes-per-row estimates because its PlanetScale values varied materially between reads.",
          "Result retention queries are bounded by typebotId batches so they can use the leading result index instead of issuing an unbounded table scan.",
          "Age-based storage figures are proportional estimates, not physical per-row measurements; archived Result rows are likely smaller than the table-wide average.",
          "The storage estimate excludes object storage and does not guarantee immediate physical disk reclamation after deletion.",
          "Member activity is account-wide, so an active member conservatively protects all of their workspaces.",
        ],
      },
    };
    const serializedReport = `${JSON.stringify(report, null, 2)}\n`;

    if (outputOption) {
      yield* runPromiseTask(`write audit report to ${outputOption}`, () =>
        writeFile(outputOption, serializedReport, "utf8"),
      );
      yield* logProgress(`Audit report written to ${outputOption}.`);
    } else yield* Effect.sync(() => process.stdout.write(serializedReport));

    return report;
  },
);

const runPromiseTask = <Value>(
  operation: string,
  query: () => Promise<Value>,
) =>
  Effect.tryPromise({
    try: query,
    catch: (cause) => new Error(`Failed to ${operation}`, { cause }),
  });

const logProgress = (message: string) =>
  Effect.sync(() => console.error(`[auditInactiveWorkspaces] ${message}`));

const getLatestDate = (
  firstDate: Date,
  ...otherDates: readonly (Date | null | undefined)[]
) => {
  let latestDate = firstDate;
  for (const date of otherDates)
    if (date && date > latestDate) latestDate = date;
  return latestDate;
};

const keepLatestDate = (
  datesById: Map<string, Date>,
  id: string,
  date: Date,
) => {
  const currentDate = datesById.get(id);
  if (!currentDate || date > currentDate) datesById.set(id, date);
};

const subtractUtcMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() - months);
  return result;
};

const subtractUtcDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
};

const getBoundedPositiveIntegerOption = ({
  args,
  name,
  fallback,
  maximum,
}: {
  args: readonly string[];
  name: string;
  fallback: number;
  maximum: number;
}) => {
  const option = getCliOption(args, name);
  if (option === undefined) return fallback;
  if (typeof option !== "string")
    throw new Error(`--${name} requires a positive integer`);
  const parsed = Number(option);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > maximum)
    throw new Error(
      `--${name} must be a positive integer no greater than ${maximum}`,
    );
  return parsed;
};

const getOptionalBoundedPositiveIntegerOption = ({
  args,
  name,
  maximum,
}: {
  args: readonly string[];
  name: string;
  maximum: number;
}) => {
  const option = getCliOption(args, name);
  if (option === undefined) return undefined;
  if (typeof option !== "string")
    throw new Error(`--${name} requires a positive integer`);
  const parsed = Number(option);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > maximum)
    throw new Error(
      `--${name} must be a positive integer no greater than ${maximum}`,
    );
  return parsed;
};

const parseNonNegativeNumber = (value: string, tableName: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0)
    throw new Error(`Invalid information_schema metric for ${tableName}`);
  return parsed;
};

const getFamilyAverageBytes = ({
  tableStorageByName,
  parentTableName,
  familyTableNames,
}: {
  tableStorageByName: ReadonlyMap<string, TableStorage>;
  parentTableName: string;
  familyTableNames: readonly string[];
}) => {
  const parentRows =
    tableStorageByName.get(parentTableName)?.approximateRows ?? 0;
  const totalBytes = familyTableNames.reduce(
    (total, tableName) =>
      total + (tableStorageByName.get(tableName)?.totalBytes ?? 0),
    0,
  );
  return {
    parentTableName,
    familyTableNames,
    approximateParentRows: parentRows,
    totalBytes,
    totalGiB: toGiB(totalBytes),
    bytesPerParent: parentRows > 0 ? totalBytes / parentRows : 0,
  };
};

const getTableAverageBytes = (table: TableStorage | undefined) => ({
  tableName: table?.name ?? "unknown",
  approximateRows: table?.approximateRows ?? 0,
  totalBytes: table?.totalBytes ?? 0,
  totalGiB: table?.totalGiB ?? 0,
  bytesPerParent:
    table && table.approximateRows > 0
      ? table.totalBytes / table.approximateRows
      : 0,
});

const getAuditedAverageBytes = (
  storageMetric: { totalBytes: number; totalGiB: number },
  auditedParentRows: number | null,
) => ({
  totalBytes: storageMetric.totalBytes,
  totalGiB: storageMetric.totalGiB,
  auditedParentRows,
  bytesPerParent:
    auditedParentRows !== null && auditedParentRows > 0
      ? storageMetric.totalBytes / auditedParentRows
      : null,
});

const getEstimatedReclaimBytes = ({
  workspaceCount,
  typebotCount,
  archivedResultCount,
  unarchivedResultCount,
  workspaceAverageBytes,
  typebotAverageBytes,
  resultAverageBytes,
  resultOnlyAverageBytes,
}: {
  workspaceCount: number;
  typebotCount: number;
  archivedResultCount: number;
  unarchivedResultCount: number;
  workspaceAverageBytes: ReturnType<typeof getAuditedAverageBytes>;
  typebotAverageBytes: ReturnType<typeof getAuditedAverageBytes>;
  resultAverageBytes: ReturnType<typeof getAuditedAverageBytes>;
  resultOnlyAverageBytes: ReturnType<typeof getAuditedAverageBytes>;
}) => {
  if (
    workspaceAverageBytes.bytesPerParent === null ||
    typebotAverageBytes.bytesPerParent === null ||
    resultAverageBytes.bytesPerParent === null ||
    resultOnlyAverageBytes.bytesPerParent === null
  )
    return null;
  return (
    workspaceCount * workspaceAverageBytes.bytesPerParent +
    typebotCount * typebotAverageBytes.bytesPerParent +
    archivedResultCount * resultOnlyAverageBytes.bytesPerParent +
    unarchivedResultCount * resultAverageBytes.bytesPerParent
  );
};

const parseResultAgeBucket = (value: string): ResultAgeBucket => {
  switch (value) {
    case "underThirtyDays":
    case "thirtyToNinetyDays":
    case "ninetyToOneHundredEightyDays":
    case "oneHundredEightyDaysToOneYear":
    case "oneToTwoYears":
    case "atLeastTwoYears":
      return value;
    default:
      throw new Error(`Unknown result age bucket: ${value}`);
  }
};

const parseArchivedFlag = (value: string) => {
  if (value === "1") return true;
  if (value === "0") return false;
  throw new Error(`Unknown archived flag: ${value}`);
};

const addResultRetentionSegment = (
  segments: Map<string, ResultRetentionSegment>,
  segment: ResultRetentionSegment,
) => {
  const key = [
    segment.ageBucket,
    segment.isArchived ? "archived" : "unarchived",
    segment.billingGroup,
    segment.hasProtectedStatus ? "protected" : "regular",
    segment.workspaceMetadataActivity,
  ].join(":");
  const currentSegment = segments.get(key);
  if (currentSegment) currentSegment.resultCount += segment.resultCount;
  else segments.set(key, segment);
};

const getResultAgeMinimumDays = (ageBucket: ResultAgeBucket) => {
  switch (ageBucket) {
    case "underThirtyDays":
      return 0;
    case "thirtyToNinetyDays":
      return 30;
    case "ninetyToOneHundredEightyDays":
      return 90;
    case "oneHundredEightyDaysToOneYear":
      return 180;
    case "oneToTwoYears":
      return 365;
    case "atLeastTwoYears":
      return 730;
  }
};

const compareResultRetentionSegments = (
  left: ResultRetentionSegment,
  right: ResultRetentionSegment,
) =>
  getResultAgeMinimumDays(right.ageBucket) -
    getResultAgeMinimumDays(left.ageBucket) ||
  left.billingGroup.localeCompare(right.billingGroup) ||
  Number(left.hasProtectedStatus) - Number(right.hasProtectedStatus) ||
  Number(left.isArchived) - Number(right.isArchived) ||
  left.workspaceMetadataActivity.localeCompare(right.workspaceMetadataActivity);

const getResultRetentionScenario = ({
  name,
  segments,
  resultFamilyAverageBytes,
  resultOnlyAverageBytes,
}: {
  name: string;
  segments: readonly ResultRetentionSegment[];
  resultFamilyAverageBytes: ReturnType<typeof getAuditedAverageBytes>;
  resultOnlyAverageBytes: ReturnType<typeof getAuditedAverageBytes>;
}) => {
  const archivedResultCount = segments.reduce(
    (total, segment) => total + (segment.isArchived ? segment.resultCount : 0),
    0,
  );
  const unarchivedResultCount = segments.reduce(
    (total, segment) => total + (segment.isArchived ? 0 : segment.resultCount),
    0,
  );
  const estimatedReclaimBytes =
    resultFamilyAverageBytes.bytesPerParent === null ||
    resultOnlyAverageBytes.bytesPerParent === null
      ? null
      : archivedResultCount * resultOnlyAverageBytes.bytesPerParent +
        unarchivedResultCount * resultFamilyAverageBytes.bytesPerParent;
  return {
    name,
    resultCount: archivedResultCount + unarchivedResultCount,
    archivedResultCount,
    unarchivedResultCount,
    estimatedReclaimBytes,
    estimatedReclaimGiB:
      estimatedReclaimBytes === null ? null : toGiB(estimatedReclaimBytes),
  };
};

const toGiB = (bytes: number) => Math.round((bytes / 1024 ** 3) * 100) / 100;

type TableStorageRow = {
  tableName: string;
  tableRows: string;
  dataBytes: string;
  indexBytes: string;
};

type TableStorage = {
  name: string;
  approximateRows: number;
  dataBytes: number;
  indexBytes: number;
  totalBytes: number;
  totalGiB: number;
};

type ProvisionalCandidate = {
  id: string;
  latestMetadataActivityAt: Date;
  typebotIds: string[];
};

type ResultUsage = {
  count: number;
  archivedCount: number;
  unarchivedCount: number;
  latestCreatedAt: Date | null;
};

type ResultRetentionRow = {
  typebotId: string;
  ageBucket: string;
  archived: string;
  resultCount: string;
  latestCreatedAt: Date | null;
};

type ResultAgeBucket =
  | "underThirtyDays"
  | "thirtyToNinetyDays"
  | "ninetyToOneHundredEightyDays"
  | "oneHundredEightyDaysToOneYear"
  | "oneToTwoYears"
  | "atLeastTwoYears";

type ResultRetentionContext = {
  billingGroup: "freeWithoutStripe" | "paidPlanOrStripeCustomer";
  hasProtectedStatus: boolean;
  workspaceMetadataActivity: "activeAfterCutoff" | "inactiveAtLeastCutoff";
};

type ResultRetentionSegment = ResultRetentionContext & {
  ageBucket: ResultAgeBucket;
  isArchived: boolean;
  resultCount: number;
};

type CandidateSummary = {
  workspaceId: string;
  latestActivityAt: string;
  typebotCount: number;
  resultCount: number;
  archivedResultCount: number;
  unarchivedResultCount: number;
};

const main = async () => {
  assertProductionEnvironment();
  await Effect.runPromise(
    auditInactiveWorkspaces().pipe(
      Effect.ensuring(Effect.promise(() => prisma.$disconnect())),
    ),
  );
};

runScript(main);
