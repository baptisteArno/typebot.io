import { $ } from "bun";
import { existsSync, readdirSync } from "fs";
import { join, resolve } from "path";

// Path to the root of your monorepo ../..
const rootDir = resolve(__dirname, "../../..");

// Function to find all packages that contain a package.json file recursively
const findPackages = (dir: string): string[] => {
  const packages: string[] = [];
  const dirs = readdirSync(dir, { withFileTypes: true });
  for (const entry of dirs) {
    if (
      entry.isDirectory() &&
      entry.name !== "node_modules" &&
      entry.name !== ".next" &&
      entry.name !== "dist" &&
      entry.name !== ".vercel"
    ) {
      const fullPath = join(dir, entry.name);
      const packageJsonPath = join(fullPath, "package.json");
      if (existsSync(packageJsonPath)) {
        packages.push(fullPath);
      }
      packages.push(...findPackages(fullPath));
    }
  }
  return packages;
};

// Main function to run depcheck on all packages
const main = async () => {
  console.log("Checking unused and missing dependencies...");
  const packages = findPackages(rootDir);
  const checks = packages.map(async (pkg) => {
    try {
      const { stdout, exitCode } =
        await $`bunx depcheck ${pkg} --ignore-patterns=.vinxi,.vercel --ignores=bun,jest-environment-jsdom,@types/jest,autoprefixer,tailwindcss`
          .nothrow()
          .quiet();

      if (exitCode === 255) {
        return {
          fail: true,
          stdout: `${pkg}/package.json:\n${stdout.toString()}`,
        };
      }
      return { fail: false };
    } catch (error) {
      return { fail: true, stdout: `Error checking ${pkg}:`, error };
    }
  });

  const statuses = await Promise.all(checks);

  if (statuses.some((status) => status.fail)) {
    console.log(
      statuses
        .filter((status) => status.fail)
        .map((status) => status.stdout)
        .join("\n\n"),
    );
    process.exit(1);
  }
};

main().then();
