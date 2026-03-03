import { expect, it } from "@effect/vitest";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proWorkspaceId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import { Name } from "@typebot.io/domain-primitives/schemas";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import { Spaces } from "../core/Spaces";
import { PrismaSpacesAuthorization } from "../infrastructure/PrismaSpacesAuthorization";
import { PrismaSpacesRepository } from "../infrastructure/PrismaSpacesRepository";
import { handleCreateSpace } from "./handleCreateSpace";
import { handleListSpaces } from "./handleListSpaces";

const SpacesInfrastructureLayer = Layer.mergeAll(
  PrismaSpacesAuthorization,
  PrismaSpacesRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PgContainerPrismaLayer),
);

export const SpacesLiveLayer = Layer.provide(
  Spaces.layer,
  SpacesInfrastructureLayer,
);

let spaceId: string;

it.layer(SpacesLiveLayer, { timeout: "30 seconds" })("SpacesLayer", (it) => {
  it.effect(
    "should create space with valid data",
    Effect.fn(function* () {
      const { space } = yield* handleCreateSpace({
        input: {
          workspaceId: proWorkspaceId,
          name: Name.make("Test Space"),
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

  it.effect(
    "lists spaces",
    Effect.fn(function* () {
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
      expect(spaces.some((s) => s.id === spaceId)).toBe(true);
    }),
  );
});
