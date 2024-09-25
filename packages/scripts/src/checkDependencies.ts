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
    if (entry.isDirectory() && entry.name !== "node_modules") {
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
  const packages = findPackages(rootDir);
  for (const pkg of packages) {
    console.log(`Checking deps from ${pkg}/package.json`);
    await $`bunx depcheck ${pkg}`.nothrow();
  }
};

main().then();
