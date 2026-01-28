import { $ } from "bun";
import { resolve } from "path";

const { stdout: worktreeRootStdout } = await $`git rev-parse --show-toplevel`;
const currentWorktreeRoot = worktreeRootStdout.toString().trim();
const { stdout: commonDirStdout } = await $`git rev-parse --git-common-dir`;
const commonDir = commonDirStdout.toString().trim();
const mainWorktreeRoot = resolve(currentWorktreeRoot, commonDir, "..");

if (currentWorktreeRoot === mainWorktreeRoot) {
  console.error(
    "Refusing to delete the main worktree. Run this from a linked worktree.",
  );
  process.exit(1);
}

const { stdout: branchStdout } = await $`git rev-parse --abbrev-ref HEAD`;
const currentBranchRaw = branchStdout.toString().trim();
const currentBranch =
  currentBranchRaw && currentBranchRaw !== "HEAD"
    ? currentBranchRaw
    : undefined;

process.chdir(mainWorktreeRoot);
await $`git worktree remove --force ${currentWorktreeRoot}`;
if (currentBranch) {
  const { exitCode } =
    await $`git show-ref --verify --quiet refs/heads/${currentBranch}`
      .nothrow()
      .quiet();
  if (exitCode === 0) await $`git branch -D ${currentBranch}`;
}
