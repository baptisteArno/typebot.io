import { join } from "node:path";
import { confirm, isCancel, select, text } from "@clack/prompts";
import { config } from "dotenv";

type InputOptions = {
  args?: readonly string[];
  message: string;
  name: string;
  validate?: (value: string) => string | undefined;
};

type IdentifierInputOptions<Value extends string> = {
  args?: readonly string[];
  message: string;
  options: readonly {
    label: string;
    name: Value;
  }[];
};

type ConfirmOptions = {
  args?: readonly string[];
  flag?: string;
  message: string;
};

type BooleanInputOptions = ConfirmOptions & {
  defaultValue: boolean;
};

export const getRequiredInput = async ({
  args = process.argv.slice(2),
  message,
  name,
  validate,
}: InputOptions) => {
  const option = getCliOption(args, name);

  if (option !== undefined) {
    if (typeof option !== "string" || option.length === 0)
      throw new Error(`--${name} requires a value`);
    const validationError = validate?.(option);
    if (validationError)
      throw new Error(`Invalid --${name}: ${validationError}`);
    return option;
  }

  assertInteractive(`Missing required --${name}=<value>`, args);

  const value = await text({ message, validate });
  if (isCancel(value) || value.length === 0)
    throw new Error(`No ${name} provided`);

  return value;
};

export const getIdentifierInput = async <Value extends string>({
  args = process.argv.slice(2),
  message,
  options,
}: IdentifierInputOptions<Value>) => {
  const providedOptions = options.flatMap((option) => {
    const value = getCliOption(args, option.name);
    return value === undefined ? [] : [{ ...option, value }];
  });

  if (providedOptions.length > 1)
    throw new Error(
      `Provide exactly one of: ${options.map(({ name }) => `--${name}=<value>`).join(", ")}`,
    );

  const providedOption = providedOptions.at(0);
  if (providedOption) {
    if (
      typeof providedOption.value !== "string" ||
      providedOption.value.length === 0
    )
      throw new Error(`--${providedOption.name} requires a value`);
    return { type: providedOption.name, value: providedOption.value };
  }

  assertInteractive(
    `Missing identifier. Provide one of: ${options.map(({ name }) => `--${name}=<value>`).join(", ")}`,
    args,
  );

  const promptOptions = options.map(({ label, name }) => ({
    label,
    value: name,
  }));
  const selectedType = await select<string>({
    message,
    options: promptOptions,
  });
  if (isCancel(selectedType)) throw new Error("No identifier provided");
  const selectedOption = options.find(({ name }) => name === selectedType);
  if (!selectedOption) throw new Error("Invalid identifier selected");

  return {
    type: selectedOption.name,
    value: await getRequiredInput({
      args,
      message: "Enter value",
      name: selectedOption.name,
    }),
  };
};

export const confirmAction = async ({
  args = process.argv.slice(2),
  flag = "confirm",
  message,
}: ConfirmOptions) => {
  const option = getCliOption(args, flag);
  if (option !== undefined) return parseBooleanOption(flag, option);

  assertInteractive(
    `Refusing to continue without --${flag}. This operation requires explicit confirmation.`,
    args,
  );

  const shouldProceed = await confirm({ message, initialValue: false });
  return shouldProceed === true;
};

export const getBooleanInput = async ({
  args = process.argv.slice(2),
  defaultValue,
  flag = "confirm",
  message,
}: BooleanInputOptions) => {
  const option = getCliOption(args, flag);
  if (option !== undefined) return parseBooleanOption(flag, option);
  if (!isInteractive(args)) return defaultValue;

  const value = await confirm({ message, initialValue: defaultValue });
  return value === true;
};

export const assertProductionEnvironment = ({
  environment = process.env,
  requiresDatabase = true,
}: {
  environment?: NodeJS.ProcessEnv;
  requiresDatabase?: boolean;
} = {}) => {
  if (environment.NX_TASK_TARGET_CONFIGURATION !== "production")
    throw new Error(
      "Production scripts must run through Nx with the production configuration.",
    );

  if (requiresDatabase && !environment.DATABASE_URL?.startsWith("mysql://"))
    throw new Error("Production DATABASE_URL must be a MySQL URL");
};

export const promptAndSetEnvironment = async ({
  args = process.argv.slice(2),
  environment = process.env,
}: {
  args?: readonly string[];
  environment?: NodeJS.ProcessEnv;
} = {}) => {
  const nxEnvironment = parseEnvironment(
    environment.NX_TASK_TARGET_CONFIGURATION,
  );
  if (nxEnvironment) return nxEnvironment;

  const cliEnvironment = getCliOption(args, "environment");
  const selectedEnvironment =
    cliEnvironment === undefined
      ? await promptForEnvironment(args)
      : parseEnvironmentOption(cliEnvironment);

  const populatedEnvironment = Object.fromEntries(
    Object.entries(environment).flatMap(([name, value]) =>
      value === undefined ? [] : [[name, value]],
    ),
  );
  config({
    override: true,
    path: join(__dirname, "..", `.env.${selectedEnvironment}`),
    processEnv: populatedEnvironment,
  });
  Object.assign(environment, populatedEnvironment);

  return selectedEnvironment;
};

export const runScript = (script: () => Promise<void>) => {
  script().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
};

export const getCliOption = (args: readonly string[], name: string) => {
  const longName = `--${name}`;
  const negatedName = `--no-${name}`;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === negatedName) return false;
    if (argument === longName) {
      const nextArgument = args[index + 1];
      return nextArgument && !nextArgument.startsWith("--")
        ? nextArgument
        : true;
    }
    if (argument?.startsWith(`${longName}=`))
      return argument.slice(longName.length + 1);
  }

  return undefined;
};

const promptForEnvironment = async (args: readonly string[]) => {
  assertInteractive(
    "Missing environment. Run through Nx with a configuration or pass --environment=<local|staging|production>.",
    args,
  );

  const environment = await select({
    message: "Pick an environment",
    options: [
      { label: "Local", value: "local" },
      { label: "Staging", value: "staging" },
      { label: "Production", value: "production" },
    ],
    initialValue: "local",
  });
  if (isCancel(environment)) throw new Error("No environment selected");
  return environment;
};

const parseEnvironmentOption = (value: string | boolean) => {
  if (typeof value !== "string")
    throw new Error("--environment requires a value");
  const environment = parseEnvironment(value);
  if (!environment)
    throw new Error(
      "Invalid --environment. Expected one of: local, staging, production",
    );
  return environment;
};

const parseEnvironment = (value: string | undefined) => {
  if (value === "local" || value === "staging" || value === "production")
    return value;
  return undefined;
};

const parseBooleanOption = (name: string, value: string | boolean) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new Error(`--${name} must be true or false`);
};

const assertInteractive = (message: string, args: readonly string[]) => {
  if (!isInteractive(args)) throw new Error(message);
};

const isInteractive = (args: readonly string[]) =>
  getCliOption(args, "non-interactive") !== true &&
  process.env.CI !== "true" &&
  process.env.CI !== "1" &&
  process.stdin.isTTY === true &&
  process.stdout.isTTY === true;
