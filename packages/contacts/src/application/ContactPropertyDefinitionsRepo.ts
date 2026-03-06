import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { type Effect, ServiceMap } from "effect";
import type {
  ContactPropertyDefinitionData,
  ContactPropertyDefinitionId,
} from "../domain/ContactPropertyDefinition";
import type {
  ContactPropertyDefinitionsAlreadyExistsError,
  ContactPropertyDefinitionsNotFoundError,
} from "../domain/errors";

export type ContactPropertyDefinitionRepoScope = {
  readonly workspaceId: WorkspaceId;
  readonly spaceId?: SpaceId;
};

export type ContactPropertyDefinitionCreateRepoInput = {
  readonly workspaceId: WorkspaceId;
  readonly spaceId?: SpaceId;
  readonly key: ContactPropertyDefinitionData["key"];
  readonly type: ContactPropertyDefinitionData["type"];
  readonly isUnique?: boolean;
};

export type ContactPropertyDefinitionUpdateRepoInput = {
  readonly workspaceId: WorkspaceId;
  readonly spaceId?: SpaceId;
  readonly definitionId: ContactPropertyDefinitionId;
  readonly key?: ContactPropertyDefinitionData["key"];
  readonly isUnique?: boolean;
};

export type ContactPropertyDefinitionDeleteRepoInput = {
  readonly workspaceId: WorkspaceId;
  readonly spaceId?: SpaceId;
  readonly definitionId: ContactPropertyDefinitionId;
};

export class ContactPropertyDefinitionsRepo extends ServiceMap.Service<
  ContactPropertyDefinitionsRepo,
  {
    readonly list: (
      scope: ContactPropertyDefinitionRepoScope,
    ) => Effect.Effect<readonly ContactPropertyDefinitionData[]>;
    readonly create: (
      input: ContactPropertyDefinitionCreateRepoInput,
    ) => Effect.Effect<
      ContactPropertyDefinitionData,
      ContactPropertyDefinitionsAlreadyExistsError
    >;
    readonly update: (
      input: ContactPropertyDefinitionUpdateRepoInput,
    ) => Effect.Effect<
      ContactPropertyDefinitionData,
      ContactPropertyDefinitionsNotFoundError
    >;
    readonly delete: (
      input: ContactPropertyDefinitionDeleteRepoInput,
    ) => Effect.Effect<void, ContactPropertyDefinitionsNotFoundError>;
  }
>()("@typebot.io/ContactPropertyDefinitionsRepo") {}
