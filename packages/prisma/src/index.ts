import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "./createPrismaAdapter";

declare const global: { prisma: PrismaClient };

if (!global.prisma) {
  global.prisma = new PrismaClient({
    adapter: createPrismaAdapter(process.env.DATABASE_URL),
  });
}

export default global.prisma;
