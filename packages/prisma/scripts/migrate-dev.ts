import { executePrismaCommand } from "./executeCommand";

if (process.env.DATABASE_URL?.startsWith("postgres"))
  executePrismaCommand("prisma migrate dev --create-only");
