import { z } from "@typebot.io/zod";
import { EventType } from "./constants";

const eventBaseSchema = z.object({
  id: z.string(),
  outgoingEdgeId: z.string().optional(),
  graphCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const startEventSchema = eventBaseSchema.extend({
  type: z.literal(EventType.START),
});
export type StartEvent = z.infer<typeof startEventSchema>;

export const commandEventSchema = eventBaseSchema.extend({
  type: z.literal(EventType.COMMAND),
  options: z
    .object({
      command: z.string().optional(),
      // TODO: remove and use Return block instead.
      resumeAfter: z.boolean().optional(),
    })
    .optional(),
});

export type CommandEvent = z.infer<typeof commandEventSchema>;

const draggableEventSchemas = [commandEventSchema];

export const eventSchema = z.discriminatedUnion("type", [
  startEventSchema,
  ...draggableEventSchemas,
]);
export type TEvent = z.infer<typeof eventSchema>;

export type TEventWithOptions = Extract<TEvent, { options?: any }>;

export const draggableEventSchema = draggableEventSchemas[0];
export type TDraggableEvent = z.infer<typeof draggableEventSchema>;
