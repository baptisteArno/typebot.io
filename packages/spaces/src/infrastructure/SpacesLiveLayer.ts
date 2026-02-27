import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import { Spaces } from "../core/Spaces";
import { PrismaSpacesAuthorization } from "./PrismaSpacesAuthorization";
import { PrismaSpacesRepository } from "./PrismaSpacesRepository";

const SpacesInfrastructureLayer = Layer.mergeAll(
  PrismaSpacesAuthorization,
  PrismaSpacesRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PrismaLayer),
);

const SpacesLiveLayer = Layer.provide(Spaces.layer, SpacesInfrastructureLayer);

export const runSpacesEffect = <A, E>(program: Effect.Effect<A, E, Spaces>) =>
  Effect.runPromise(program.pipe(Effect.provide(SpacesLiveLayer)));
