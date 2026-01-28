import { $ } from "bun";
import { resolve } from "path";

const args = Bun.argv.slice(2);

if (args.length === 0) {
  console.error(
    "No worktree name provided. Usage: bun create-worktree <worktree-name>",
  );
  process.exit(1);
}

const projectRoot = resolve(__dirname, "..");
const worktreeName = getValidatedWorktreeName(args[0]);
const worktreePath = `${process.env.HOME}/.typebot-worktrees/${worktreeName}`;

await $`git fetch origin`;
await $`git checkout main`;
await $`git rebase origin/main --autostash`;
await $`git worktree add -b ${worktreeName} ${worktreePath} origin/main`;
await $`echo ${worktreePath} && cd ${worktreePath} && cp ${projectRoot}/.env . && cp -r ${projectRoot}/apps/viewer/src/test/.auth apps/viewer/src/test/.auth && bun install`;

function getValidatedWorktreeName(value: string | undefined) {
  const trimmedValue = value?.trim() ?? "";
  if (trimmedValue.length === 0) {
    console.error(
      "No worktree name provided. Usage: bun create-worktree <worktree-name>",
    );
    process.exit(1);
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(trimmedValue)) {
    console.error(
      "Invalid worktree name. Use letters, numbers, and hyphens only.",
    );
    process.exit(1);
  }

  return trimmedValue;
}
