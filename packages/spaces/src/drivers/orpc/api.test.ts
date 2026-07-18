import { expect, it } from "@effect/vitest";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { FeatureFlags } from "@typebot.io/feature-flags/application/FeatureFlags";
import { SpaceId, UserId, WorkspaceId } from "@typebot.io/shared-core/domain";
import { WorkspaceAccessPolicies } from "@typebot.io/workspaces/application/WorkspaceAccessPolicies";
import { Effect, Layer, Schema } from "effect";
import { SpacesRepo } from "../../application/SpacesRepo";
import { SpacesUsecases } from "../../application/SpacesUsecases";
import { SpaceNotFoundError } from "../../domain/errors";
import { Space, SpaceName } from "../../domain/Space";
import { handleCreateSpace } from "./handleCreateSpace";
import { handleDeleteSpace } from "./handleDeleteSpace";
import { handleListSpaces } from "./handleListSpaces";
import { handlePatchSpace } from "./handlePatchSpace";

const userId = Schema.decodeSync(UserId)("seedUserId");
const proWorkspaceId = Schema.decodeSync(WorkspaceId)("proWorkspace");

const MockWorkspaceAccessPoliciesLayer = Layer.succeed(
  WorkspaceAccessPolicies,
  WorkspaceAccessPolicies.of({
    canRead: () => Effect.succeed(true),
    canWrite: () => Effect.succeed(true),
  }),
);

const spaces: Space[] = [];
let spaceIdSequence = 0;

const MockSpacesRepoLayer = Layer.succeed(
  SpacesRepo,
  SpacesRepo.of({
    list: (input) =>
      Effect.succeed(
        spaces.filter((space) => space.workspaceId === input.workspaceId),
      ),
    create: (input) =>
      Effect.sync(() => {
        spaceIdSequence += 1;
        const space = new Space({
          id:
            input.id ?? Schema.decodeSync(SpaceId)(`space-${spaceIdSequence}`),
          name: input.name,
          icon: input.icon ?? null,
          workspaceId: input.workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        spaces.unshift(space);
        return space;
      }),
    patch: (input) =>
      Effect.gen(function* () {
        const spaceIndex = spaces.findIndex(
          (space) =>
            space.id === input.spaceId &&
            space.workspaceId === input.workspaceId,
        );
        if (spaceIndex === -1) return yield* new SpaceNotFoundError();

        const existingSpace = spaces[spaceIndex];
        const updatedSpace = new Space({
          ...existingSpace,
          name: input.name ?? existingSpace.name,
          icon: input.icon === undefined ? existingSpace.icon : input.icon,
          updatedAt: new Date(),
        });
        spaces[spaceIndex] = updatedSpace;
        return updatedSpace;
      }),
    delete: (input) =>
      Effect.gen(function* () {
        const spaceIndex = spaces.findIndex(
          (space) =>
            space.id === input.spaceId &&
            space.workspaceId === input.workspaceId,
        );
        if (spaceIndex === -1) return yield* new SpaceNotFoundError();

        spaces.splice(spaceIndex, 1);
      }),
  }),
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
    MockWorkspaceAccessPoliciesLayer,
    MockSpacesRepoLayer,
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
