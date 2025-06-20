import { spawn } from "child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import * as p from "@clack/prompts";
import { isCancel, spinner } from "@clack/prompts";

interface CliArgs {
  name?: string;
  id?: string;
  auth?: "apiKey" | "encryptedData" | "none";
  help?: boolean;
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const parseArgs = (args: string[]): CliArgs => {
  const result: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--name" || arg === "-n") {
      result.name = args[++i];
    } else if (arg === "--id") {
      result.id = args[++i];
    } else if (arg === "--auth" || arg === "-a") {
      const authValue = args[++i];
      if (
        authValue === "apiKey" ||
        authValue === "encryptedData" ||
        authValue === "none"
      ) {
        result.auth = authValue;
      } else {
        console.error(
          `Invalid auth value: ${authValue}. Must be one of: apiKey, encryptedData, none`,
        );
        process.exit(1);
      }
    }
  }

  return result;
};

const showHelp = () => {
  console.log(`
Usage: bun create-new-block [options]

Options:
  --name, -n <name>     Integration name (e.g., "Sheets", "Analytics", "Cal.com")
  --id <id>             Integration ID (slug format, e.g., "cal-com", "openai")
  --auth, -a <type>     Authentication type: apiKey, encryptedData, or none
  --help, -h            Show this help message

Examples:
  bun create-new-block --name "My Service" --id "my-service" --auth "apiKey"
  bun create-new-block -n "Analytics" --id "analytics" -a "none"
  
If no arguments are provided, the interactive mode will be used.
`);
};

type PromptResult = {
  name: string;
  id: string;
  auth: "apiKey" | "encryptedData" | "none";
  camelCaseId: string;
};

const getPromptFromArgs = (args: CliArgs): PromptResult => {
  if (!args.name || !args.id || !args.auth) {
    console.error(
      "Missing required arguments. Use --help for usage information.",
    );
    process.exit(1);
  }

  if (!slugRegex.test(args.id)) {
    console.error(
      `Invalid ID: ${args.id}. Must be a slug, like: "google-sheets".`,
    );
    process.exit(1);
  }

  return {
    name: args.name,
    id: args.id,
    auth: args.auth,
    camelCaseId: camelize(args.id),
  };
};

const getPromptInteractive = async (): Promise<PromptResult> => {
  p.intro("Create a new Typebot integration block");
  const { name, id } = await p.group(
    {
      name: () =>
        p.text({
          message: "Integration name?",
          placeholder: "Short name like: Sheets, Analytics, Cal.com",
        }),
      id: ({ results }) =>
        p.text({
          message:
            "Integration ID? (should be a slug like: cal-com, openai...)",
          placeholder: "my-integration",
          initialValue: slugify(results.name ?? ""),
          validate: (val) => {
            if (!slugRegex.test(val))
              return 'Invalid ID. Must be a slug, like: "google-sheets".';
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  const auth = await p.select({
    message: "Does this integration require authentication to work?",
    options: [
      { value: "apiKey", label: "API key or token" },
      { value: "encryptedData", label: "Custom encrypted data" },
      { value: "none", label: "None" },
    ],
  });

  if (!auth || isCancel(auth)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return {
    name,
    id: id as string,
    auth,
    camelCaseId: camelize(id as string),
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    return;
  }

  const prompt: PromptResult =
    args.name && args.id && args.auth
      ? getPromptFromArgs(args)
      : await getPromptInteractive();

  const s = spinner();
  s.start("Creating files...");
  const newBlockPath = join(process.cwd(), `../blocks/${prompt.camelCaseId}`);
  if (existsSync(newBlockPath) && readdirSync(newBlockPath).length > 1) {
    s.stop("Creating files...");
    p.log.error(
      `An integration with the ID "${prompt.id}" already exists. Please choose a different ID.`,
    );
    process.exit(1);
  }
  if (!existsSync(newBlockPath)) mkdirSync(newBlockPath);
  const srcPath = join(newBlockPath, "src");
  if (!existsSync(srcPath)) mkdirSync(srcPath);
  await createPackageJson(newBlockPath, prompt);
  await createTsConfig(newBlockPath);
  await createIndexFile(srcPath, prompt);
  await createLogoFile(srcPath, prompt);
  if (prompt.auth !== "none") await createAuthFile(srcPath, prompt);
  await createSchemasFile(srcPath, prompt);
  await addBlockToRepository(prompt);
  s.stop("Creating files...");
  s.start("Installing dependencies...");
  try {
    await new Promise<void>((resolve, reject) => {
      const ls = spawn("bun", ["install"]);
      ls.stderr.on("data", () => {});
      ls.on("error", (error) => {
        reject(error);
      });
      ls.on("close", () => {
        resolve();
      });
    });
  } catch (err) {
    console.log("An error occured while installing packages:");
  }
  s.stop("Installing dependencies...");

  s.start("Formatting...");
  try {
    await new Promise<void>((resolve, reject) => {
      const ls = spawn("bunx", ["turbo", "//#format-and-lint:fix"]);
      ls.stderr.on("data", (data) => {
        console.log(data.toString());
      });
      ls.on("error", (error) => {
        reject(error);
      });
      ls.on("close", () => {
        resolve();
      });
    });
  } catch (err) {
    console.log("An error occured while formating:");
    console.log(err);
  }
  s.stop("Formatting...");
  p.outro(
    `Done! 🎉 Head over to packages/forge/blocks/${prompt.camelCaseId} and start coding!`,
  );
};

const slugify = (str: string): string => {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9\. -]/g, "") // remove non-alphanumeric characters
    .replace(/[\s\.]+/g, "-") // replace spaces and dots with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
};

const camelize = (str: string) =>
  str.replace(/-([a-z])/g, (g) => (g[1] ?? "").toUpperCase());

const capitalize = (str: string) => {
  const [fst] = str;

  return `${fst?.toUpperCase()}${str.slice(1)}`;
};

const createIndexFile = async (
  path: string,
  { id, camelCaseId, name, auth }: PromptResult,
) => {
  const camelCaseName = camelize(id as string);
  writeFileSync(
    join(path, "index.ts"),
    `import { createBlock } from '@typebot.io/forge'
import { ${capitalize(camelCaseId)}Logo } from './logo'
${auth !== "none" ? `import { auth } from './auth'` : ""}

export const ${camelCaseName}Block = createBlock({
  id: '${id}',
  name: '${name}',
  tags: [],
  LightLogo: ${capitalize(camelCaseName)}Logo,${auth !== "none" ? `auth,` : ""}
  actions: [],
})
`,
  );
};

const createPackageJson = async (path: string, { id }: { id: unknown }) => {
  writeFileSync(
    join(path, "package.json"),
    JSON.stringify(
      {
        name: `@typebot.io/${id}-block`,
        private: true,
        type: "module",
        exports: {
          ".": "./src/index.ts",
          "./schemas": "./src/schemas.ts",
        },
        dependencies: {
          "@typebot.io/forge": "workspace:*",
        },
        devDependencies: {
          "@typebot.io/tsconfig": "workspace:*",
        },
      },
      null,
      2,
    ),
  );
};

const createTsConfig = async (path: string) => {
  writeFileSync(
    join(path, "tsconfig.json"),
    JSON.stringify({
      extends: "@typebot.io/tsconfig/react.json",
      include: ["src/**/*.ts", "src/**/*.tsx"],
    }),
  );
};

const createLogoFile = async (
  path: string,
  { camelCaseId }: { camelCaseId: string },
) => {
  writeFileSync(
    join(path, "logo.tsx"),
    `/** @jsxImportSource react */

      export const ${capitalize(camelCaseId)}Logo = (props: React.SVGProps<SVGSVGElement>) => <svg></svg>
      `,
  );
};

const createAuthFile = async (
  path: string,
  { name, auth }: { name: string; auth: "apiKey" | "encryptedData" | "none" },
) =>
  writeFileSync(
    join(path, "auth.ts"),
    `import { option } from '@typebot.io/forge'
import type { AuthDefinition } from '@typebot.io/forge/types'

        export const auth = {
          type: 'encryptedCredentials',
          name: '${name} account',
          ${
            auth === "apiKey"
              ? `schema: option.object({
                    apiKey: option.string.layout({
                      label: 'API key',
                      isRequired: true,
                      inputType: 'password',
                      helperText:
                        'You can generate an API key [here](<INSERT_URL>).',
                      withVariableButton: false,
                      isDebounceDisabled: true,
                    }),
                  }),`
              : ""
          }
        } satisfies AuthDefinition`,
  );

const addBlockToRepository = async ({
  auth,
  camelCaseId,
  id,
}: {
  auth: string;
  camelCaseId: string;
  id: string;
}) => {
  const schemasPath = await addBlockToRepoPackageJson(id);
  await addBlockToRepoDefinitions(schemasPath, camelCaseId, id);
  await addBlockToRepoConstants(schemasPath, id);
  await addBlockToRepoSchemas(schemasPath, camelCaseId, id);
  if (auth !== "none")
    await addBlockToCredentialsRepoSchemas(schemasPath, camelCaseId, id);
};

const createSchemasFile = async (
  path: string,
  {
    id,
    auth,
  }: { id: string; name: string; auth: "apiKey" | "encryptedData" | "none" },
) => {
  const camelCaseName = camelize(id as string);
  writeFileSync(
    join(path, "schemas.ts"),
    `// Do not edit this file manually
import { ${auth !== "none" ? "parseBlockCredentials," : ""} parseBlockSchema } from '@typebot.io/forge'
import { ${camelCaseName}Block } from '.'${
      auth !== "none" ? `\nimport { auth } from './auth'` : ""
    }

export const ${camelCaseName}BlockSchema = parseBlockSchema(${camelCaseName}Block)
${
  auth !== "none"
    ? `export const ${camelCaseName}CredentialsSchema = parseBlockCredentials(${camelCaseName}Block.id, auth.schema)`
    : ""
}`,
  );
};

async function addBlockToRepoDefinitions(
  schemasPath: string,
  camelCaseId: string,
  id: string,
) {
  const existingDefinitionsData = readFileSync(
    join(schemasPath, "src", "definitions.ts"),
  ).toString();
  const importStatement = `import { ${camelCaseId}Block } from '@typebot.io/${id}-block'`;
  const objectEntry = `  [${camelCaseId}Block.id]: ${camelCaseId}Block,`;
  const nextLineImportIndex = existingDefinitionsData.indexOf(
    "\n",
    existingDefinitionsData.lastIndexOf("import"),
  );

  const newObjectEntryIndex = existingDefinitionsData.lastIndexOf(",") + 1;

  const newDefinitionsData = `${existingDefinitionsData.slice(
    0,
    nextLineImportIndex,
  )}
${importStatement}
${existingDefinitionsData.slice(nextLineImportIndex, newObjectEntryIndex)}
${objectEntry}
${existingDefinitionsData.slice(newObjectEntryIndex)}`;

  writeFileSync(join(schemasPath, "src", "definitions.ts"), newDefinitionsData);
}

async function addBlockToRepoSchemas(
  schemasPath: string,
  camelCaseId: string,
  id: string,
) {
  const existingDefinitionsData = readFileSync(
    join(schemasPath, "src", "schemas.ts"),
  ).toString();
  const [existingImports, existingDefinitions, existingSchemas] =
    existingDefinitionsData.split("\n\n");

  writeFileSync(
    join(schemasPath, "src", "schemas.ts"),
    `${existingImports}
import { ${camelCaseId}Block } from '@typebot.io/${id}-block'
import { ${camelCaseId}BlockSchema } from '@typebot.io/${id}-block/schemas'

${existingDefinitions.replace(
  "} as const;",
  "",
)}[${camelCaseId}Block.id]: ${camelCaseId}BlockSchema,} as const;

${existingSchemas.replace(
  "]);\nexport type ForgedBlock = z.infer<typeof forgedBlockSchema>;\n",
  "",
)}${camelCaseId}BlockSchema]);
export type ForgedBlock = z.infer<typeof forgedBlockSchema>;`,
  );
}

async function addBlockToCredentialsRepoSchemas(
  schemasPath: string,
  camelCaseId: string,
  id: string,
) {
  const existingSchemasData = readFileSync(
    join(schemasPath, "src", "credentials.ts"),
  ).toString();
  const importStatement = `import { ${camelCaseId}Block } from '@typebot.io/${id}-block'
import { ${camelCaseId}CredentialsSchema } from '@typebot.io/${id}-block/schemas'`;
  const objectEntry = `  [${camelCaseId}Block.id]: ${camelCaseId}CredentialsSchema,`;
  const nextLineImportIndex = existingSchemasData.indexOf(
    "\n",
    existingSchemasData.lastIndexOf("import"),
  );

  const newObjectEntryIndex = existingSchemasData.lastIndexOf(",") + 1;

  const newDefinitionsData = `${existingSchemasData.slice(
    0,
    nextLineImportIndex,
  )}
${importStatement}
${existingSchemasData.slice(nextLineImportIndex, newObjectEntryIndex)}
${objectEntry}
${existingSchemasData.slice(newObjectEntryIndex)}`;

  writeFileSync(join(schemasPath, "src", "credentials.ts"), newDefinitionsData);
}

async function addBlockToRepoConstants(schemasPath: string, id: string) {
  const existingDefinitionsData = readFileSync(
    join(schemasPath, "src", "constants.ts"),
  ).toString();

  writeFileSync(
    join(schemasPath, "src", "constants.ts"),
    existingDefinitionsData.replace(
      `] as const satisfies readonly ForgedBlock["type"][]`,
      `'${id}'] as const satisfies readonly ForgedBlock["type"][]`,
    ),
  );
}

async function addBlockToRepoPackageJson(id: string) {
  const schemasPath = join(process.cwd(), `../repository`);
  const packageJson = require(join(schemasPath, "package.json"));
  packageJson.dependencies[`@typebot.io/${id}-block`] = "workspace:*";
  writeFileSync(
    join(schemasPath, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );
  return schemasPath;
}

main()
  .then()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
