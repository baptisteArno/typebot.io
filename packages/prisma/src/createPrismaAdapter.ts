import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

export const createPrismaAdapter = (databaseUrl: string | undefined) => {
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  if (
    databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://")
  )
    return new PrismaPg({ connectionString: databaseUrl });

  if (databaseUrl.startsWith("mysql://"))
    return new PrismaPlanetScale({ url: databaseUrl });

  throw new Error(
    "Invalid `DATABASE_URL` format, it should start with `postgresql://`, `postgres://` or `mysql://`",
  );
};
