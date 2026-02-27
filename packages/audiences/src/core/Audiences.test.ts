import { describe, expect, it } from "@effect/vitest";
import {
  Name,
  type Name as NameType,
} from "@typebot.io/domain-primitives/schemas";
import { UserId, type UserId as UserIdType } from "@typebot.io/user/schemas";
import {
  WorkspaceId,
  type WorkspaceId as WorkspaceIdType,
} from "@typebot.io/workspaces/schemas";
import { Effect, Layer } from "effect";
import { Audience, AudienceId } from "./Audience";
import { Audiences } from "./Audiences";
import { AudiencesAuthorization } from "./AudiencesAuthorization";
import { AlreadyExistsError, ForbiddenError } from "./AudiencesErrors";
import { AudiencesRepository } from "./AudiencesRepository";

const workspaceId = WorkspaceId.make("workspace_1");
const userId = UserId.make("user_1");
const audience = Audience.make({
  id: AudienceId.make("audience_1"),
  name: Name.make("VIP customers"),
  workspaceId,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
});

describe("list", () => {
  it.effect(
    "returns the list of audiences when user can list audiences",
    () => {
      const canListAudiencesCalls: Array<[WorkspaceIdType, UserIdType]> = [];
      const listByWorkspaceIdCalls: WorkspaceIdType[] = [];

      return Effect.gen(function* () {
        const audiences = yield* Audiences;
        const listedAudiences = yield* audiences.list({
          workspaceId,
          userId,
        });

        expect(listedAudiences).toEqual([audience]);
        expect(canListAudiencesCalls).toEqual([[workspaceId, userId]]);
        expect(listByWorkspaceIdCalls).toEqual([workspaceId]);
      }).pipe(
        Effect.provide(
          makeAudiencesLayer({
            canListAudiences: (workspaceId, userId) =>
              Effect.sync(() => {
                canListAudiencesCalls.push([workspaceId, userId]);
                return true;
              }),
            listByWorkspaceId: (workspaceId) =>
              Effect.sync(() => {
                listByWorkspaceIdCalls.push(workspaceId);
                return [audience] as const;
              }),
          }),
        ),
      );
    },
  );
  it.effect("fails with ForbiddenError when user cannot list audiences", () => {
    const listByWorkspaceIdCalls: WorkspaceIdType[] = [];

    return Effect.gen(function* () {
      const audiences = yield* Audiences;
      const result = yield* audiences
        .list({ workspaceId, userId })
        .pipe(Effect.either);

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(ForbiddenError);
      }
      expect(listByWorkspaceIdCalls).toEqual([]);
    }).pipe(
      Effect.provide(
        makeAudiencesLayer({
          canListAudiences: () => Effect.succeed(false),
          listByWorkspaceId: (workspaceId) =>
            Effect.sync(() => {
              listByWorkspaceIdCalls.push(workspaceId);
              return [audience] as const;
            }),
        }),
      ),
    );
  });
});

describe("create", () => {
  it.effect("creates an audience when user can create audience", () => {
    const canCreateAudienceCalls: Array<[WorkspaceIdType, UserIdType]> = [];
    const createCalls: Array<[WorkspaceIdType, { name: NameType }]> = [];
    const input = { name: Name.make("Paid users") };

    return Effect.gen(function* () {
      const audiences = yield* Audiences;
      const createdAudience = yield* audiences.create(
        { workspaceId, userId },
        input,
      );

      expect(createdAudience).toEqual(audience);
      expect(canCreateAudienceCalls).toEqual([[workspaceId, userId]]);
      expect(createCalls).toEqual([[workspaceId, input]]);
    }).pipe(
      Effect.provide(
        makeAudiencesLayer({
          canCreateAudience: (workspaceId, userId) =>
            Effect.sync(() => {
              canCreateAudienceCalls.push([workspaceId, userId]);
              return true;
            }),
          create: (workspaceId, input) =>
            Effect.sync(() => {
              createCalls.push([workspaceId, input]);
              return audience;
            }),
        }),
      ),
    );
  });

  it.effect(
    "fails with ForbiddenError when user cannot create audience",
    () => {
      const createCalls: Array<[WorkspaceIdType, { name: NameType }]> = [];

      return Effect.gen(function* () {
        const audiences = yield* Audiences;
        const result = yield* audiences
          .create({ workspaceId, userId }, { name: Name.make("Blocked users") })
          .pipe(Effect.either);

        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(ForbiddenError);
        }
        expect(createCalls).toEqual([]);
      }).pipe(
        Effect.provide(
          makeAudiencesLayer({
            canCreateAudience: () => Effect.succeed(false),
            create: (workspaceId, input) =>
              Effect.sync(() => {
                createCalls.push([workspaceId, input]);
                return audience;
              }),
          }),
        ),
      );
    },
  );

  it("fails with AlreadyExistsError when audience with the same name already exists", async () => {
    const result = await Effect.gen(function* () {
      const audiences = yield* Audiences;
      return yield* audiences
        .create({ workspaceId, userId }, { name: Name.make("VIP customers") })
        .pipe(Effect.either);
    }).pipe(
      Effect.provide(
        makeAudiencesLayer({
          canCreateAudience: () => Effect.succeed(true),
          create: () => Effect.fail(new AlreadyExistsError()),
        }),
      ),
      Effect.runPromise,
    );

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(AlreadyExistsError);
    }
  });
});

type CanListAudiences = (
  workspaceId: WorkspaceIdType,
  userId: UserIdType,
) => Effect.Effect<boolean>;
type CanCreateAudience = (
  workspaceId: WorkspaceIdType,
  userId: UserIdType,
) => Effect.Effect<boolean>;
type ListByWorkspaceId = (
  workspaceId: WorkspaceIdType,
) => Effect.Effect<readonly Audience[]>;
type CreateAudience = (
  workspaceId: WorkspaceIdType,
  input: { name: NameType },
) => Effect.Effect<Audience, AlreadyExistsError>;

const makeAudiencesLayer = ({
  canListAudiences = () => Effect.succeed(true),
  canCreateAudience = () => Effect.succeed(true),
  listByWorkspaceId = () => Effect.succeed([audience] as const),
  create = () => Effect.succeed(audience),
}: {
  canListAudiences?: CanListAudiences;
  canCreateAudience?: CanCreateAudience;
  listByWorkspaceId?: ListByWorkspaceId;
  create?: CreateAudience;
} = {}) =>
  Audiences.layer.pipe(
    Layer.provide(
      Layer.mergeAll(
        Layer.succeed(AudiencesAuthorization, {
          canListAudiences,
          canCreateAudience,
        }),
        Layer.succeed(AudiencesRepository, {
          listByWorkspaceId,
          create,
        }),
      ),
    ),
  );
