import type { TypebotId, UserId } from "@typebot.io/shared-core/domain";
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
