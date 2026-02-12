import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";
import { createPrismaAdapter } from "./createPrismaAdapter";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

if (!process.env.DATABASE_URL_REPLICA) {
  throw new Error("DATABASE_URL_REPLICA is not set");
}

const primaryPrismaClient = new PrismaClient({
  adapter: createPrismaAdapter(process.env.DATABASE_URL),
});

const replicaPrismaClient = new PrismaClient({
  adapter: createPrismaAdapter(process.env.DATABASE_URL_REPLICA),
});

const prisma = primaryPrismaClient.$extends(
  readReplicas({
    replicas: [replicaPrismaClient],
  }),
);

export default prisma;
