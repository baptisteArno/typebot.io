import { ORPCError } from "@orpc/server";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { Effect } from "effect";
import type { SpaceCreateInput } from "../../application/SpacesRepo";
import { SpacesUsecases } from "../../application/SpacesUsecases";

export const handleCreateSpace = Effect.fn("handleCreateSpace")(
  function* ({
    input,
    context: { user },
  }: {
    input: SpaceCreateInput;
    context: { user: UserInOrpcContext };
  }) {
    const spacesUsecases = yield* SpacesUsecases;
    const space = yield* spacesUsecases.create(input, { userId: user.id });
    return { space };
  },
  Effect.catchTags({
    SpaceAlreadyExistsError: () =>
      Effect.fail(
        new ORPCError("CONFLICT", {
          message: "A space with this name already exists",
        }),
      ),
    ForbiddenSpaceAccessError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "You are not allowed to create a space in this workspace",
        }),
      ),
    SpacesFeatureDisabledError: () =>
      Effect.fail(
        new ORPCError("FORBIDDEN", {
          message: "Spaces are not enabled for this account",
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create space",
        cause: defect,
      }),
    ),
  ),
);
