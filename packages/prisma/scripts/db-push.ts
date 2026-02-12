import { executePrismaCommand } from "./executeCommand";

executePrismaCommand("prisma db push --accept-data-loss");
