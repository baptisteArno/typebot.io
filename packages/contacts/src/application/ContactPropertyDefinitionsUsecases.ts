import { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceRepo } from "@typebot.io/workspaces/application/WorkspaceRepo";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema, ServiceMap } from "effect";
import type { ContactPropertyDefinitionData } from "../domain/ContactPropertyDefinition";
import {
  ContactPropertyDefinitionId,
  ContactPropertyDefinitionKey,
  ContactPropertyTypeSchema,
} from "../domain/ContactPropertyDefinition";
import type {
  ContactPropertyDefinitionsAlreadyExistsError,
  ContactPropertyDefinitionsNotFoundError,
} from "../domain/errors";
import { ContactsForbiddenError } from "../domain/errors";
import { ContactPropertyDefinitionsRepo } from "./ContactPropertyDefinitionsRepo";

export const ContactPropertyDefinitionCreateInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
  key: ContactPropertyDefinitionKey,
  type: ContactPropertyTypeSchema,
  isUnique: Schema.optional(Schema.Boolean),
});
export type ContactPropertyDefinitionCreateInput =
  typeof ContactPropertyDefinitionCreateInputSchema.Type;

export const ContactPropertyDefinitionUpdateInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
  definitionId: ContactPropertyDefinitionId,
  key: Schema.optional(ContactPropertyDefinitionKey),
  isUnique: Schema.optional(Schema.Boolean),
});
export type ContactPropertyDefinitionUpdateInput =
  typeof ContactPropertyDefinitionUpdateInputSchema.Type;

export const ContactPropertyDefinitionDeleteInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
  definitionId: ContactPropertyDefinitionId,
});
export type ContactPropertyDefinitionDeleteInput =
  typeof ContactPropertyDefinitionDeleteInputSchema.Type;

export class ContactPropertyDefinitionsUsecases extends ServiceMap.Service<
  ContactPropertyDefinitionsUsecases,
  {
    readonly list: (resource: {
      workspaceId: WorkspaceId;
      spaceId?: SpaceId;
      userId: UserId;
    }) => Effect.Effect<
      readonly ContactPropertyDefinitionData[],
      ContactsForbiddenError
    >;
    readonly create: (
      input: ContactPropertyDefinitionCreateInput,
      userId: UserId,
    ) => Effect.Effect<
      ContactPropertyDefinitionData,
      ContactPropertyDefinitionsAlreadyExistsError | ContactsForbiddenError
    >;
    readonly update: (
      input: ContactPropertyDefinitionUpdateInput,
      userId: UserId,
    ) => Effect.Effect<
      ContactPropertyDefinitionData,
      ContactPropertyDefinitionsNotFoundError | ContactsForbiddenError
    >;
    readonly delete: (
      input: ContactPropertyDefinitionDeleteInput,
      userId: UserId,
    ) => Effect.Effect<
      void,
      ContactPropertyDefinitionsNotFoundError | ContactsForbiddenError
    >;
  }
>()("@typebot.io/ContactPropertyDefinitionsUsecases") {
  static readonly layer = Layer.effect(
    ContactPropertyDefinitionsUsecases,
    Effect.gen(function* () {
      const repo = yield* ContactPropertyDefinitionsRepo;
      const workspaceRepo = yield* WorkspaceRepo;

      const list = Effect.fn("ContactPropertyDefinitionsUsecases.list")(
        function* ({
          workspaceId,
          spaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          spaceId?: SpaceId;
          userId: UserId;
        }): Effect.fn.Return<
          readonly ContactPropertyDefinitionData[],
          ContactsForbiddenError
        > {
          const canList = yield* workspaceRepo.canReadWorkspace(
            workspaceId,
            userId,
          );
          if (!canList) return yield* new ContactsForbiddenError();
          return yield* repo.list({ workspaceId, spaceId });
        },
      );

      const create = Effect.fn("ContactPropertyDefinitionsUsecases.create")(
        function* (
          input: ContactPropertyDefinitionCreateInput,
          userId: UserId,
        ): Effect.fn.Return<
          ContactPropertyDefinitionData,
          ContactPropertyDefinitionsAlreadyExistsError | ContactsForbiddenError
        > {
          const canCreate = yield* workspaceRepo.canAdminWriteWorkspace(
            input.workspaceId,
            userId,
          );
          if (!canCreate) return yield* new ContactsForbiddenError();
          return yield* repo.create(input);
        },
      );

      const update = Effect.fn("ContactPropertyDefinitionsUsecases.update")(
        function* (
          input: ContactPropertyDefinitionUpdateInput,
          userId: UserId,
        ): Effect.fn.Return<
          ContactPropertyDefinitionData,
          ContactPropertyDefinitionsNotFoundError | ContactsForbiddenError
        > {
          const canUpdate = yield* workspaceRepo.canAdminWriteWorkspace(
            input.workspaceId,
            userId,
          );
          if (!canUpdate) return yield* new ContactsForbiddenError();
          return yield* repo.update(input);
        },
      );

      const delete_ = Effect.fn("ContactPropertyDefinitionsUsecases.delete")(
        function* (
          input: ContactPropertyDefinitionDeleteInput,
          userId: UserId,
        ): Effect.fn.Return<
          void,
          ContactPropertyDefinitionsNotFoundError | ContactsForbiddenError
        > {
          const canDelete = yield* workspaceRepo.canAdminWriteWorkspace(
            input.workspaceId,
            userId,
          );
          if (!canDelete) return yield* new ContactsForbiddenError();
          return yield* repo.delete(input);
        },
      );

      return ContactPropertyDefinitionsUsecases.of({
        list,
        create,
        update,
        delete: delete_,
      });
    }),
  );
}
