import * as p from "@clack/prompts";
import fs, { existsSync } from "fs";
import path from "path";
import type { WorkspaceSummaryType } from "./workspaceSummaryBuilders";
import {
  buildWorkspaceSummaryObject,
  getWorkspaceAISummary,
  saveToFile,
  toReadableFormat,
} from "./workspaceSummaryBuilders";

const getWorkspaceSummary = async () => {
  const workspaceId = await p.text({
    message: "Enter workspace ID",
  });

  if (!workspaceId || typeof workspaceId !== "string") {
    console.error("❌ Workspace ID is required");
    return;
  }
  // ask if user wants to use existing summary or build a new one
  const useExisting = await p.confirm({
    message:
      "Do you want to use the existing workspace summary if it exists? (Otherwise, a new summary will be built)",
    initialValue: true,
  });

  // if workspace summary already exists, fetch summary from file
  const summaryFilePath = path.join(
    __dirname,
    `../../logs/workspaces/${workspaceId}/workspaceSummary.json`,
  );
  let summary: WorkspaceSummaryType | null = null;

  if (existsSync(summaryFilePath) && useExisting) {
    console.log(" ✓ Workspace summary already exists, fetching from file...");
    const summaryData = fs.readFileSync(summaryFilePath, "utf-8");
    summary = JSON.parse(summaryData);
    console.log(" ✓ Workspace summary fetched from file.");
    // remove ai analysis if it exists
    if (summary?.aiAnalysis) {
      delete summary.aiAnalysis;
      console.log(" ✓ AI analysis removed from the summary.");
    }
  } else {
    // otherwise, build workspace summary and save it
    summary = await buildWorkspaceSummaryObject(workspaceId);
    if (!summary) {
      console.error(`❌ Failed to build workspace summary for ${workspaceId}`);
      return;
    }
    console.log(" ✓ Workspace summary built successfully.");
    // save to file
    saveToFile(
      `${workspaceId}/workspaceSummary.json`,
      JSON.stringify(summary, null, 2),
    );
    console.log(
      " ✓ Workspace summary saved to:",
      `${workspaceId}/workspaceSummary.json`,
    );
  }

  console.log(" ✓ Generating AI analysis of the workspace summary...");
  const workspaceSummary = JSON.stringify(summary, null, 2);
  const aiAnalysis = await getWorkspaceAISummary(workspaceSummary);

  if (summary) {
    Object.assign(summary, { aiAnalysis });
    console.log(" ✓ AI analysis added to the workspace summary.");
    // save to file
    saveToFile(
      `${workspaceId}/workspaceSummary.json`,
      JSON.stringify(summary, null, 2),
    );
    console.log(
      " ✓ Workspace summary saved to:",
      `${workspaceId}/workspaceSummary.json`,
    );

    // save to readable markdown file
    const readableSummary = toReadableFormat(summary);
    console.log(readableSummary);
    saveToFile(`${workspaceId}/summary.md`, readableSummary);
    console.log(" ✓ Summary saved to:", `${workspaceId}/summary.md`);
  }
};

getWorkspaceSummary();
