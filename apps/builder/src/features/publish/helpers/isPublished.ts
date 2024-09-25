import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { diff } from "deep-object-diff";
import { dequal } from "dequal";

export const isPublished = (
  typebot: Typebot,
  publicTypebot: PublicTypebot,
  debug?: boolean,
) => {
  if (debug)
    console.log(
      "diff:",
      diff(
        JSON.parse(JSON.stringify(typebot.groups)),
        JSON.parse(JSON.stringify(publicTypebot.groups)),
      ),
    );
  return (
    dequal(
      JSON.parse(JSON.stringify(typebot.groups)),
      JSON.parse(JSON.stringify(publicTypebot.groups)),
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.settings)),
      JSON.parse(JSON.stringify(publicTypebot.settings)),
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.theme)),
      JSON.parse(JSON.stringify(publicTypebot.theme)),
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.variables)),
      JSON.parse(JSON.stringify(publicTypebot.variables)),
    ) &&
    dequal(
      JSON.parse(JSON.stringify(typebot.events)),
      JSON.parse(JSON.stringify(publicTypebot.events)),
    )
  );
};
