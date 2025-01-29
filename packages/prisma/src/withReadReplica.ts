import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";

if (!process.env.DATABASE_URL_REPLICA) {
  throw new Error("DATABASE_URL_REPLICA is not set");
}

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: process.env.DATABASE_URL_REPLICA,
  }),
);

export default prisma;
