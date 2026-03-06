import type { TypebotId } from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { Context, type Effect } from "effect";

export class TypebotAuthorization extends Context.Tag(
  "@typebot.io/TypebotAuthorization",
)<
  TypebotAuthorization,
  {
    readonly canReadTypebot: (
      typebotId: TypebotId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canWriteTypebot: (
      typebotId: TypebotId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
