import { expect, it } from "@effect/vitest";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proWorkspaceId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import type { SegmentId } from "@typebot.io/shared-primitives/domain";
import { PrismaWorkspaceRepository } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepository";
import { Effect, Layer } from "effect";
import { SegmentsUsecases } from "../../application/SegmentsUsecases";
import { SegmentName } from "../../domain/Segment";
import { PrismaSegmentsRepository } from "../../infrastructure/PrismaSegmentsRepository";
import { handleCreateSegment } from "./handleCreateSegment";
import { handleListSegments } from "./handleListSegments";

const SegmentsInfrastructureLayer = Layer.mergeAll(
  PrismaSegmentsRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PgContainerPrismaLayer));

const SegmentsLiveLayer = Layer.provide(
  SegmentsUsecases.layer,
  SegmentsInfrastructureLayer,
);

let segmentId: SegmentId;

it.layer(SegmentsLiveLayer, { timeout: "30 seconds" })(
  "SegmentsLayer",
  (it) => {
    it.effect("should create segment with valid data", () =>
      Effect.gen(function* () {
        const { segment } = yield* handleCreateSegment({
          input: {
            workspaceId: proWorkspaceId,
            name: SegmentName.makeUnsafe("VIP customers"),
          },
          context: {
            user: {
              id: userId,
            },
          },
        });
        segmentId = segment.id;

        expect(segment).toBeDefined();
        expect(segment.name).toBe("VIP customers");
        expect(segment.workspaceId).toBe(proWorkspaceId);
      }),
    );

    it.effect("lists segments", () =>
      Effect.gen(function* () {
        const { segments } = yield* handleListSegments({
          input: {
            workspaceId: proWorkspaceId,
          },
          context: {
            user: {
              id: userId,
            },
          },
        });
        expect(segments.length).toBeGreaterThanOrEqual(1);
        expect(segments.some((segment) => segment.id === segmentId)).toBe(true);
      }),
    );
  },
);
