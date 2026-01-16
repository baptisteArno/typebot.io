#!/usr/bin/env bun
import { copyFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const args = Bun.argv.slice(2);

if (args.length < 1) exitWithUsage();

const repoRoot = process.cwd();
const worktreePath = resolve(repoRoot, args[0]);
const branchName = args[1] ?? deriveBranchName(args[0]);

await ensureGitWorktree(worktreePath, branchName);
await copyEnvFile(repoRoot, worktreePath);

async function ensureGitWorktree(path: string, branch: string) {
  const branchExists = await gitBranchExists(branch);
  const command = branchExists
    ? ["git", "worktree", "add", path, branch]
    : ["git", "worktree", "add", "-b", branch, path];

  await runCommand(command);
}

async function gitBranchExists(branch: string) {
  const proc = Bun.spawn(
    ["git", "show-ref", "--verify", "--quiet", `refs/heads/${branch}`],
    { stdout: "ignore", stderr: "ignore" },
  );
  const exitCode = await proc.exited;
  return exitCode === 0;
}

async function copyEnvFile(root: string, worktreePath: string) {
  const source = resolve(root, ".env");
  const target = resolve(worktreePath, ".env");
  const hasEnv = await Bun.file(source).exists();

  if (!hasEnv) {
    console.warn("No .env found in repo root, skipping copy.");
    return;
  }

  await copyFile(source, target);
  console.log(`Copied .env to ${target}`);
}

async function runCommand(command: string[]) {
  const proc = Bun.spawn(command, { stdout: "inherit", stderr: "inherit" });
  const exitCode = await proc.exited;

  if (exitCode !== 0) throw new Error(`Command failed: ${command.join(" ")}`);
}

function deriveBranchName(input: string) {
  const base = basename(input);
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized.length > 0 ? sanitized : "worktree";
}

function exitWithUsage() {
  console.error("Usage: bun scripts/new-worktree.ts <path> [branch]");
  process.exit(1);
}
