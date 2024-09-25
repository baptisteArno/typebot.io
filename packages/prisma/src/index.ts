import { PrismaClient } from "@prisma/client";

declare const global: { prisma: PrismaClient };

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

export default global.prisma;
