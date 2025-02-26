import { existsSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { $ } from "bun";

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
  let failed = false;
  const packages = findPackages(rootDir);
  const checks = packages.map(async (pkg) => {
    try {
      const { stdout, exitCode } =
        await $`bunx depcheck ${pkg} --ignore-patterns=.vinxi,.vercel --ignores=bun,jest-environment-jsdom,@types/jest,autoprefixer,tailwindcss`
          .nothrow()
          .quiet();

      if (exitCode === 255) {
        console.log(`${pkg}/package.json`);
        console.log(stdout.toString());
        failed = true;
      }
    } catch (error) {
      console.error(`Error checking ${pkg}:`, error);
      failed = true;
    }
  });

  await Promise.all(checks);

  if (failed) {
    process.exit(1);
  }
};

main().then();
