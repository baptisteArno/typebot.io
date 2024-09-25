import { executePrismaCommand } from "./executeCommand";

executePrismaCommand("cross-env BROWSER=none prisma studio");
