import type { Name } from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, Effect, Layer } from "effect";
import type { Audience } from "./Audience";
import { AudiencesAuthorization } from "./AudiencesAuthorization";
import { type AlreadyExistsError, ForbiddenError } from "./AudiencesErrors";
import { AudiencesRepository } from "./AudiencesRepository";

export class Audiences extends Context.Tag("@typebot.io/Audiences")<
  Audiences,
  {
    readonly create: (
      ressource: {
        workspaceId: WorkspaceId;
        userId: UserId;
      },
      input: { name: Name },
    ) => Effect.Effect<Audience, AlreadyExistsError | ForbiddenError>;
    readonly list: (ressource: {
      workspaceId: WorkspaceId;
      userId: UserId;
    }) => Effect.Effect<readonly Audience[], ForbiddenError>;
  }
>() {
  static readonly layer = Layer.effect(
    Audiences,
    Effect.gen(function* () {
      const audiencesRepository = yield* AudiencesRepository;
      const audiencesAuthorization = yield* AudiencesAuthorization;

      const list = Effect.fn("Audiences.list")(function* ({
        workspaceId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        userId: UserId;
      }) {
        const canList = yield* audiencesAuthorization.canListAudiences(
          workspaceId,
          userId,
        );

        if (!canList) return yield* new ForbiddenError();

        return yield* audiencesRepository.listByWorkspaceId(workspaceId);
      });

      const create = Effect.fn("Audiences.create")(function* (
        {
          workspaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          userId: UserId;
        },
        input: { name: Name },
      ) {
        const canCreate = yield* audiencesAuthorization.canCreateAudience(
          workspaceId,
          userId,
        );

        if (!canCreate) return yield* new ForbiddenError();

        return yield* audiencesRepository.create(workspaceId, input);
      });

      return Audiences.of({
        list,
        create,
      });
    }),
  );
}
