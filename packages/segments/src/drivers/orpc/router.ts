import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceRepository } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepository";
import { Effect, Layer } from "effect";
import { SegmentsUsecases } from "../../application/SegmentsUsecases";
import { PrismaSegmentsRepository } from "../../infrastructure/PrismaSegmentsRepository";
import {
  CreateSegmentInputStandardSchema,
  handleCreateSegment,
} from "./handleCreateSegment";
import {
  handleListSegments,
  listSegmentsInputSchema,
} from "./handleListSegments";

const SegmentsInfrastructureLayer = Layer.mergeAll(
  PrismaSegmentsRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PrismaLayer));

export const SegmentsLiveLayer = Layer.provide(
  SegmentsUsecases.layer,
  SegmentsInfrastructureLayer,
);

const runSegmentsEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, SegmentsUsecases>,
) => Effect.runPromise(handler.pipe(Effect.provide(SegmentsLiveLayer)));

export const segmentsRouter = {
  list: authenticatedProcedure
    .input(listSegmentsInputSchema)
    .handler((props) => runSegmentsEffectHandler(handleListSegments(props))),
  create: authenticatedProcedure
    .input(CreateSegmentInputStandardSchema)
    .handler((props) => runSegmentsEffectHandler(handleCreateSegment(props))),
};
