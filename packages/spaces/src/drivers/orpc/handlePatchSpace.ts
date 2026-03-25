import { ORPCError } from "@orpc/server";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { Effect } from "effect";
import type { SpacePatchInput } from "../../application/SpacesRepo";
import { SpacesUsecases } from "../../application/SpacesUsecases";

export const handlePatchSpace = Effect.fn("handlePatchSpace")(
  function* ({
    input,
    context: { user },
  }: {
    input: SpacePatchInput;
    context: { user: UserInOrpcContext };
  }) {
    const spacesUsecases = yield* SpacesUsecases;
    const space = yield* spacesUsecases.patch(input, { userId: user.id });
    return { space };
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
          message: "You are not allowed to update this space",
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
        message: "Failed to update space",
        cause: defect,
      }),
    ),
  ),
);
