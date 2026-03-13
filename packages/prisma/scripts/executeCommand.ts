import { exec } from "node:child_process";
import { join, relative } from "node:path";

const prismaPackagePath = join(__dirname, "..");

const postgresqlSchemaPath = relative(
  prismaPackagePath,
  join(prismaPackagePath, "postgresql/schema.prisma"),
);

const mysqlSchemaPath = relative(
  prismaPackagePath,
  join(prismaPackagePath, "mysql/schema.prisma"),
);

const prismaConfigPath = relative(
  prismaPackagePath,
  join(prismaPackagePath, "prisma.config.ts"),
);

type Options = {
  force?: boolean;
  includeSchema?: boolean;
};

export const executePrismaCommand = (command: string, options?: Options) => {
  const databaseUrl =
    process.env.DATABASE_URL ?? (options?.force ? "postgresql://" : undefined);
  const includeSchema = options?.includeSchema ?? true;

  if (!databaseUrl) {
    console.error("Could not find DATABASE_URL in environment");
    process.exit(1);
    return;
  }

  if (databaseUrl?.startsWith("mysql://")) {
    console.log("Executing for MySQL schema");
    return executeCommand(
      `${command} --config ${prismaConfigPath}${
        includeSchema ? ` --schema ${mysqlSchemaPath}` : ""
      }`,
    );
  }

  if (
    databaseUrl?.startsWith("postgres://") ||
    databaseUrl?.startsWith("postgresql://")
  ) {
    console.log("Executing for PostgreSQL schema");
    return executeCommand(
      `${command} --config ${prismaConfigPath}${
        includeSchema ? ` --schema ${postgresqlSchemaPath}` : ""
      }`,
    );
  }

  console.error(
    "Invalid `DATABASE_URL` format, it should start with `postgresql://`, `postgres://` or `mysql://`",
  );
  process.exit(1);
};

const executeCommand = (command: string) => {
  return new Promise<void>((resolve, reject) => {
    exec(command, { cwd: prismaPackagePath }, (error, stdout, stderr) => {
      if (error) {
        console.log(error.message);
        reject(error);
        return;
      }
      if (stderr) console.log(stderr);
      if (stdout) console.log(stdout);
      resolve();
    });
  });
};
