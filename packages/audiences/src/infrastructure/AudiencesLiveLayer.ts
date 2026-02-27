import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import { Audiences } from "../core/Audiences";
import { PrismaAudiencesAuthorization } from "./PrismaAudiencesAuthorization";
import { PrismaAudiencesRepository } from "./PrismaAudiencesRepository";

const AudiencesInfrastructureLayer = Layer.mergeAll(
  PrismaAudiencesAuthorization,
  PrismaAudiencesRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PrismaLayer),
);

const AudiencesLiveLayer = Layer.provide(
  Audiences.layer,
  AudiencesInfrastructureLayer,
);

export const runAudiencesEffect = <A, E>(
  program: Effect.Effect<A, E, Audiences>,
) => Effect.runPromise(program.pipe(Effect.provide(AudiencesLiveLayer)));
