import { omit } from "@typebot.io/lib/utils";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { dequal } from "dequal";

export const areTypebotsEqual = (typebotA: Typebot, typebotB: Typebot) =>
  dequal(
    JSON.parse(JSON.stringify(omit(typebotA, "updatedAt"))),
    JSON.parse(JSON.stringify(omit(typebotB, "updatedAt"))),
  );
