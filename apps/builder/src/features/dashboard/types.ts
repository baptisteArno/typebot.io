import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

export type TypebotInDashboard = Pick<Typebot, "id" | "name" | "icon"> & {
  publishedTypebotId?: string;
};
