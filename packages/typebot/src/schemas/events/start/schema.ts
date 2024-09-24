import { z } from "@typebot.io/zod";
import { EventType } from "../constants";
import { eventBaseSchema } from "../shared";

export const startEventSchema = eventBaseSchema
  .extend({
    type: z.literal(EventType.START),
  })
  .openapi({
    description: "Event",
    ref: "event",
  });
export type StartEvent = z.infer<typeof startEventSchema>;
