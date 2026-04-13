import { z } from "zod";

export const textInputSchema = z.object({
  id: z.string(),
  type: z.literal("text"),
  groupId: z.string(),
  options: z
    .object({
      variableId: z.string().optional(),
      placeholder: z.string().optional(),
      ariaLabel: z.string().optional(),
      isRequired: z.boolean().optional(),
    })
    .optional(),
});

export type TextInputBlock = z.infer<typeof textInputSchema>;
