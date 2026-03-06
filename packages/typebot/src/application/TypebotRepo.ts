import type { TypebotId } from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { type Effect, ServiceMap } from "effect";

export class TypebotRepo extends ServiceMap.Service<
  TypebotRepo,
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
>()("@typebot.io/TypebotRepo") {}
