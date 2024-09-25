import { writeFileSync } from "fs";
import jsPackageJson from "../../embeds/js/package.json";
import nextjsPackageJson from "../../embeds/nextjs/package.json";
import reactPackageJson from "../../embeds/react/package.json";

const currentVersion = jsPackageJson.version;

const patchNumber = Number.parseInt(currentVersion.split(".")[2], 10);

const newVersion = `${currentVersion.split(".")[0]}.${
  currentVersion.split(".")[1]
}.${patchNumber + 1}`;

writeFileSync(
  "./packages/embeds/js/package.json",
  JSON.stringify(
    {
      ...jsPackageJson,
      version: newVersion,
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  "./packages/embeds/react/package.json",
  JSON.stringify(
    {
      ...reactPackageJson,
      version: newVersion,
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  "./packages/embeds/nextjs/package.json",
  JSON.stringify(
    {
      ...nextjsPackageJson,
      version: newVersion,
    },
    null,
    2,
  ) + "\n",
);
