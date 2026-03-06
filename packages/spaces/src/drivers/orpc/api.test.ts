import { expect, it } from "@effect/vitest";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proWorkspaceId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import { PrismaWorkspaceRepository } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepository";
import { Effect, Layer } from "effect";
import { SpacesUsecases } from "../../application/SpacesUsecases";
import { PrismaSpacesRepository } from "../../infrastructure/PrismaSpacesRepository";
import { handleCreateSpace } from "./handleCreateSpace";
import { handleListSpaces } from "./handleListSpaces";

const SpacesInfrastructureLayer = Layer.mergeAll(
  PrismaSpacesRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PgContainerPrismaLayer));

export const SpacesLiveLayer = Layer.provide(
  SpacesUsecases.layer,
  SpacesInfrastructureLayer,
);

let spaceId: string;

it.layer(SpacesLiveLayer, { timeout: "30 seconds" })("SpacesLayer", (it) => {
  it.effect("should create space with valid data", () =>
    Effect.gen(function* () {
      const { space } = yield* handleCreateSpace({
        input: {
          workspaceId: proWorkspaceId,
          name: "Test Space",
        },
        context: {
          user: {
            id: userId,
          },
        },
      });
      spaceId = space.id;
      expect(space).toBeDefined();
      expect(space.name).toBe("Test Space");
      expect(space.workspaceId).toBe(proWorkspaceId);
    }),
  );

  it.effect("lists spaces", () =>
    Effect.gen(function* () {
      const { spaces } = yield* handleListSpaces({
        input: {
          workspaceId: proWorkspaceId,
        },
        context: {
          user: {
            id: userId,
          },
        },
      });
      expect(spaces.length).toBeGreaterThanOrEqual(1);
      expect(spaces.some((space) => space.id === spaceId)).toBe(true);
    }),
  );
});
