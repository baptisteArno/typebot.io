import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

const getSchemaFromUrl = (url: string): string | undefined => {
  try {
    return new URL(url).searchParams.get("schema") ?? undefined;
  } catch {
    return undefined;
  }
};

export const createPrismaAdapter = (databaseUrl: string | undefined) => {
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  if (
    databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://")
  )
    // The `?schema=` search param is applied by Prisma Migrate but the driver
    // adapter does not read it from the connection string, so pass it through
    // explicitly. Without this, runtime queries default to the `public` schema
    // even when the tables live in a custom schema.
    return new PrismaPg(
      { connectionString: databaseUrl },
      { schema: getSchemaFromUrl(databaseUrl) },
    );

  if (databaseUrl.startsWith("mysql://"))
    return new PrismaPlanetScale({ url: databaseUrl });

  throw new Error(
    "Invalid `DATABASE_URL` format, it should start with `postgresql://`, `postgres://` or `mysql://`",
  );
};
