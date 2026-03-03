import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import { Segments } from "../core/Segments";
import { PrismaSegmentsAuthorization } from "../infrastructure/PrismaSegmentsAuthorization";
import { PrismaSegmentsRepository } from "../infrastructure/PrismaSegmentsRepository";
import {
  CreateSegmentInputSchema,
  handleCreateSegment,
} from "./handleCreateSegment";
import {
  handleListSegments,
  listSegmentsInputSchema,
} from "./handleListSegments";

const SegmentsInfrastructureLayer = Layer.mergeAll(
  PrismaSegmentsAuthorization,
  PrismaSegmentsRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PrismaLayer),
);

export const SegmentsLiveLayer = Layer.provide(
  Segments.layer,
  SegmentsInfrastructureLayer,
);

const runSegmentsEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, Segments>,
) => Effect.runPromise(handler.pipe(Effect.provide(SegmentsLiveLayer)));

export const segmentsRouter = {
  list: authenticatedProcedure
    .input(listSegmentsInputSchema)
    .handler((props) => runSegmentsEffectHandler(handleListSegments(props))),
  create: authenticatedProcedure
    .input(CreateSegmentInputSchema)
    .handler((props) => runSegmentsEffectHandler(handleCreateSegment(props))),
};
