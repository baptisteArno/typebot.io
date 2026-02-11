import { $ } from "bun";

const currentWorktreeRoot = (
  await $`git rev-parse --show-toplevel`.text()
).trim();
const gitCommonDir = (
  await $`git rev-parse --path-format=absolute --git-common-dir`.text()
).trim();
const mainWorktreeRoot = (
  await $`cd ${gitCommonDir} && cd .. && pwd`.text()
).trim();

await $`cd ${currentWorktreeRoot} && bun install`;
await $`cp ${mainWorktreeRoot}/.env ${currentWorktreeRoot}/.env`;
await $`cp -R ${mainWorktreeRoot}/apps/viewer/src/test/.auth ${currentWorktreeRoot}/apps/viewer/src/test/.auth`;
