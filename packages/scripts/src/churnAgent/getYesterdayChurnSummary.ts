import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { executePostHogQuery } from "../helpers/executePostHogQuery";
import type { workspaceSummaryType } from "../workspaceSummaryAgent/WorkspaceSummaryBuilders";
import {
  buildWorkspaceSummaryObject,
  getWorkspaceAISummary,
  toReadableFormat,
} from "../workspaceSummaryAgent/WorkspaceSummaryBuilders";

export const getYesterdayChurnSummary = async ({
  onSummaryGenerated,
}: {
  onSummaryGenerated: (summary: workspaceSummaryType) => Promise<void>;
}): Promise<workspaceSummaryType[]> => {
  // set yesterday's date
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  console.log(`📊 Starting churn summary analysis for ${yesterday}`);

  // Query for "Subscription updated" events (has both prevPlan and plan)
  const churnedWorkspacesQuery = `
      SELECT events.\`$group_1\` AS workspace_id, max(events.created_at) as max_created_at FROM events
      WHERE event = 'Subscription scheduled for cancellation'
      AND toDate(timestamp) = toDate(now() - INTERVAL 1 DAY)
      GROUP BY workspace_id
      ORDER BY max_created_at DESC
    `;

  // Fetch workspaces on posthog
  console.log("🔍 Querying PostHog for churned workspaces...");
  const churnedWorkspacesResponse = await executePostHogQuery(
    churnedWorkspacesQuery,
  );

  const totalChurnedWorkspaces = churnedWorkspacesResponse.results.length;
  console.log(`📈 Found ${totalChurnedWorkspaces} churned workspaces`);

  if (totalChurnedWorkspaces === 0) {
    console.log("✨ No churned workspaces found for yesterday");
    return [];
  }

  // Iterate over workspaces and generate summaries
  const summaries: workspaceSummaryType[] = [];
  for (const [index, row] of churnedWorkspacesResponse.results.entries()) {
    const workspaceId = row[0] as string;
    console.log(
      `\n🏢 Processing workspace ${index + 1}/${totalChurnedWorkspaces}: ${workspaceId}`,
    );

    console.log(`   📥 Fetching workspace data...`);
    const workspaceSummaryObject =
      await buildWorkspaceSummaryObject(workspaceId);

    if (!workspaceSummaryObject) {
      console.error(`❌ Workspace not found: ${workspaceId}`);
      continue;
    }

    console.log(`   📝 Workspace: ${workspaceSummaryObject.workspace.name}`);
    console.log(
      `   🤖 Typebots: ${workspaceSummaryObject.typebots.total_typebots}`,
    );

    if (
      workspaceSummaryObject.subscription.stripe_id &&
      !workspaceSummaryObject.subscription.list?.[0]?.cancellation_reason
    ) {
      console.log(`   ❌ Cancellation was most likely unscheduled`);
      continue;
    }

    // generate AI summary
    console.log(`   🤖 Generating AI churn summary...`);
    const workspaceSummaryString = JSON.stringify(
      workspaceSummaryObject,
      null,
      2,
    );
    const ai_analysis = await getWorkspaceAISummary(workspaceSummaryString);
    Object.assign(workspaceSummaryObject, { ai_analysis: ai_analysis });

    console.log(`   ✅ Success`);

    // Save summary to file
    const workspaceSummaryPath = path.join(
      __dirname,
      `../../logs/workspaces/${workspaceId}/summary.txt`,
    );
    createFolderIfNotExists(workspaceSummaryPath);
    writeFileSync(
      workspaceSummaryPath,
      JSON.stringify(workspaceSummaryObject, null, 2),
    );
    summaries.push(workspaceSummaryObject);

    // Generate readable summary and print and save to file
    const readable_summary = toReadableFormat(workspaceSummaryObject);
    console.log(readable_summary);
    const workspaceReadableSummaryPath = path.join(
      __dirname,
      `../../logs/workspaces/${workspaceId}/summary.md`,
    );
    writeFileSync(workspaceReadableSummaryPath, readable_summary);
  }

  console.log(
    `\n🎉 Churn analysis complete! Generated ${summaries.length} summaries.`,
  );
  return summaries;
};

const createFolderIfNotExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};
