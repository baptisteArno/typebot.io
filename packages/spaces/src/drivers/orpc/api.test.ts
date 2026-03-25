import { expect, it } from "@effect/vitest";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proWorkspaceId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import { FeatureFlags } from "@typebot.io/feature-flags/application/FeatureFlags";
import type { UserId } from "@typebot.io/shared-core/domain";
import { WorkspaceAccessPolicies } from "@typebot.io/workspaces/application/WorkspaceAccessPolicies";
import { PrismaWorkspaceRepo } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepo";
import { Effect, Layer, Schema } from "effect";
import { SpacesUsecases } from "../../application/SpacesUsecases";
import { type Space, SpaceName } from "../../domain/Space";
import { PrismaSpacesRepo } from "../../infrastructure/PrismaSpacesRepo";
import { handleCreateSpace } from "./handleCreateSpace";
import { handleDeleteSpace } from "./handleDeleteSpace";
import { handleListSpaces } from "./handleListSpaces";
import { handlePatchSpace } from "./handlePatchSpace";

const WorkspaceAccessPolicyLiveLayer = Layer.provide(
  WorkspaceAccessPolicies.layer,
  Layer.provide(PrismaWorkspaceRepo, PgContainerPrismaLayer),
);

const SpacesRepoLiveLayer = Layer.provide(
  PrismaSpacesRepo,
  PgContainerPrismaLayer,
);

const MockFeatureFlagsLayer = Layer.succeed(
  FeatureFlags,
  FeatureFlags.of({
    isEnabled: Effect.fn("MockFeatureFlags.isEnabled")(function* (
      key: string,
      _context: { userId: UserId },
    ) {
      return yield* Effect.succeed(key === "spaces");
    }),
  }),
);

export const SpacesUsecasesLiveLayer = Layer.provide(
  SpacesUsecases.layer,
  Layer.mergeAll(
    WorkspaceAccessPolicyLiveLayer,
    SpacesRepoLiveLayer,
    MockFeatureFlagsLayer,
  ),
);

const contextUser: UserInOrpcContext = {
  id: userId,
  email: "test@test.com",
  groupTitlesAutoGeneration: null,
};

let spaceId: Space["id"];

it.layer(SpacesUsecasesLiveLayer, { timeout: "30 seconds" })(
  "SpacesLayer",
  (it) => {
    it.effect("should create space with valid data", () =>
      Effect.gen(function* () {
        const { space } = yield* handleCreateSpace({
          input: {
            workspaceId: proWorkspaceId,
            name: Schema.decodeSync(SpaceName)("Test Space"),
          },
          context: {
            user: contextUser,
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
            user: contextUser,
          },
        });
        expect(spaces.length).toBeGreaterThanOrEqual(1);
        expect(spaces.some((space) => space.id === spaceId)).toBe(true);
      }),
    );

    it.effect("patches a space name", () =>
      Effect.gen(function* () {
        const { space } = yield* handlePatchSpace({
          input: {
            workspaceId: proWorkspaceId,
            spaceId,
            name: Schema.decodeSync(SpaceName)("Updated Space"),
          },
          context: {
            user: contextUser,
          },
        });
        expect(space.id).toBe(spaceId);
        expect(space.name).toBe("Updated Space");
      }),
    );

    it.effect("deletes a space", () =>
      Effect.gen(function* () {
        yield* handleDeleteSpace({
          input: {
            workspaceId: proWorkspaceId,
            spaceId,
          },
          context: {
            user: contextUser,
          },
        });

        const { spaces } = yield* handleListSpaces({
          input: {
            workspaceId: proWorkspaceId,
          },
          context: {
            user: contextUser,
          },
        });
        expect(spaces.some((space) => space.id === spaceId)).toBe(false);
      }),
    );
  },
);
