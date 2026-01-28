import { tmpdir } from "node:os";
import { $ } from "bun";
import { resolve } from "path";

const args = Bun.argv.slice(2);

if (args.length === 0) {
  console.error(
    "No worktree name provided. Usage: bun pick-worktree-changes <worktree-name>",
  );
  process.exit(1);
}

const projectRoot = resolve(__dirname, "../");
const worktreeName = getValidatedWorktreeName(args[0]);
const worktreePath = `${process.env.HOME}/.typebot-worktrees/${worktreeName}`;

const { exitCode: worktreeExists } = await $`test -d ${worktreePath}`
  .nothrow()
  .quiet();
if (worktreeExists !== 0) {
  console.error(`Worktree not found at ${worktreePath}`);
  process.exit(1);
}

const mainStatus = await $`git -C ${projectRoot} status --porcelain`.text();
if (mainStatus.trim().length > 0) {
  console.error(
    "Main worktree has uncommitted changes. Commit or stash them before picking changes.",
  );
  process.exit(1);
}

const committedDiff =
  await $`git -C ${worktreePath} diff --binary main...HEAD`.text();
const workingDiff = await $`git -C ${worktreePath} diff --binary HEAD`.text();
const patch = [committedDiff, workingDiff]
  .map((value) => value.trim())
  .filter((value) => value.length > 0)
  .join("\n");

const untrackedOutput =
  await $`git -C ${worktreePath} ls-files --others --exclude-standard`.text();
const untrackedFiles = untrackedOutput
  .split("\n")
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

if (patch.length === 0 && untrackedFiles.length === 0) {
  console.log(`No changes found in worktree "${worktreeName}".`);
  process.exit(0);
}

if (patch.length > 0) {
  const patchPath = await resolve(
    tmpdir(),
    `typebot-worktree-pick-${Date.now()}.patch`,
  );
  await Bun.write(patchPath, `${patch}\n`);
  try {
    await $`git -C ${projectRoot} apply --3way --whitespace=nowarn ${patchPath}`;
  } finally {
    await $`rm -f ${patchPath}`;
  }
}

for (const filePath of untrackedFiles) {
  const sourcePath = resolve(worktreePath, filePath);
  const targetPath = resolve(projectRoot, filePath);
  const targetDir = resolve(targetPath, "..");
  await $`mkdir -p ${targetDir}`;
  await $`cp -R ${sourcePath} ${targetPath}`;
}

console.log(`Picked changes from worktree "${worktreeName}" into main.`);

function getValidatedWorktreeName(value: string | undefined) {
  const trimmedValue = value?.trim() ?? "";
  if (trimmedValue.length === 0) {
    console.error(
      "No worktree name provided. Usage: bun pick-worktree-changes <worktree-name>",
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
