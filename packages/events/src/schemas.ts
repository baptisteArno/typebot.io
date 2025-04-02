import { optionBaseSchema } from "@typebot.io/blocks-base/schemas";
import { conditionSchema } from "@typebot.io/conditions/schemas";
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
      resumeAfter: z.boolean().optional(),
    })
    .optional(),
});

const onMessageEventOptionsSchema = optionBaseSchema.merge(
  z.object({
    exitCondition: z
      .object({
        isEnabled: z.boolean().optional(),
        condition: conditionSchema.optional(),
      })
      .optional(),
  }),
);

export const onMessageEventSchema = eventBaseSchema.extend({
  type: z.literal(EventType.ON_MESSAGE),
  options: onMessageEventOptionsSchema.optional(),
});

export type CommandEvent = z.infer<typeof commandEventSchema>;
export type OnMessageEvent = z.infer<typeof onMessageEventSchema>;

const draggableEventSchemas = [commandEventSchema, onMessageEventSchema];

export const eventSchema = z.discriminatedUnion("type", [
  startEventSchema,
  ...draggableEventSchemas,
]);

export const draggableEventSchema = z.discriminatedUnion("type", [
  commandEventSchema,
  onMessageEventSchema,
]);

export type TEvent = z.infer<typeof eventSchema>;

export type TEventWithOptions = Extract<TEvent, { options?: any }>;

export type TDraggableEvent = z.infer<typeof draggableEventSchema>;
