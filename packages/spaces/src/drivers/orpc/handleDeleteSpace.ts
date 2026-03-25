import { ORPCError } from "@orpc/server";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { Effect } from "effect";
import type { SpaceDeleteInput } from "../../application/SpacesRepo";
import { SpacesUsecases } from "../../application/SpacesUsecases";

export const handleDeleteSpace = Effect.fn("handleDeleteSpace")(
  function* ({
    input,
    context: { user },
  }: {
    input: SpaceDeleteInput;
    context: { user: UserInOrpcContext };
  }) {
    const spacesUsecases = yield* SpacesUsecases;
    yield* spacesUsecases.delete(input, { userId: user.id });
  },
  Effect.catchTags({
    SpaceNotFoundError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Space not found",
        }),
      ),
    ForbiddenSpaceAccessError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "You are not allowed to delete this space",
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
        message: "Failed to delete space",
        cause: defect,
      }),
    ),
  ),
);
