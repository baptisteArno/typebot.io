import { Layer } from "effect";
import { PrismaClientService, PrismaService } from "../.effect";
import prisma from ".";

export const PrismaLayer = Layer.provide(
  PrismaService.Default,
  Layer.succeed(PrismaClientService, prisma),
);
