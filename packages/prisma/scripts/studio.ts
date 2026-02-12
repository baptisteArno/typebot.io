import { executePrismaCommand } from "./executeCommand";

executePrismaCommand("BROWSER=none prisma studio --port 5555", {
  includeSchema: false,
});
