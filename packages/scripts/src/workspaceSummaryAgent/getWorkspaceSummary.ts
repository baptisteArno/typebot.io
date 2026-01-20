import * as p from "@clack/prompts";
import fs, { existsSync } from "fs";
import path from "path";
import type { workspaceSummaryType } from "./workspaceSummaryBuilders";
import {
  buildWorkspaceSummaryObject,
  getWorkspaceAISummary,
  saveToFile,
  toReadableFormat,
} from "./workspaceSummaryBuilders";

const generateWorkspaceSummary = async () => {
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
  let summary: workspaceSummaryType | null = null;

  if (existsSync(summaryFilePath) && useExisting) {
    console.log(" ✓ Workspace summary already exists, fetching from file...");
    const summaryData = fs.readFileSync(summaryFilePath, "utf-8");
    summary = JSON.parse(summaryData);
    console.log(" ✓ Workspace summary fetched from file.");
    // remove ai analysis if it exists
    if (summary?.ai_analysis) {
      delete summary?.ai_analysis;
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
  const ai_analysis = await getWorkspaceAISummary(workspaceSummary);

  if (summary && ai_analysis) {
    Object.assign(summary, { ai_analysis: ai_analysis });
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
    const readable_summary = toReadableFormat(summary);
    console.log(readable_summary);
    saveToFile(`${workspaceId}/summary.md`, readable_summary);
    console.log(" ✓ Summary saved to:", `${workspaceId}/summary.md`);
  }
};

generateWorkspaceSummary();
