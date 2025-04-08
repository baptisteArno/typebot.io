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

const replyEventOptionsSchema = optionBaseSchema.merge(
  z.object({
    exitCondition: z
      .object({
        isEnabled: z.boolean().optional(),
        condition: conditionSchema.optional(),
      })
      .optional(),
  }),
);

export const replyEventSchema = eventBaseSchema.extend({
  type: z.literal(EventType.REPLY),
  options: replyEventOptionsSchema.optional(),
});

export type CommandEvent = z.infer<typeof commandEventSchema>;
export type ReplyEvent = z.infer<typeof replyEventSchema>;

const draggableEventSchemas = [commandEventSchema, replyEventSchema];

export const eventSchema = z.discriminatedUnion("type", [
  startEventSchema,
  ...draggableEventSchemas,
]);

export const draggableEventSchema = z.discriminatedUnion("type", [
  commandEventSchema,
  replyEventSchema,
]);

export type TEvent = z.infer<typeof eventSchema>;

export type TEventWithOptions = Extract<TEvent, { options?: any }>;

export type TDraggableEvent = z.infer<typeof draggableEventSchema>;
