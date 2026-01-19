import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { themeTemplateSchema } from "@typebot.io/theme/schemas";
import { z } from "zod";
import {
  deleteThemeTemplateInputSchema,
  handleDeleteThemeTemplate,
} from "./handleDeleteThemeTemplate";
import {
  handleListThemeTemplates,
  listThemeTemplatesInputSchema,
} from "./handleListThemeTemplates";
import {
  handleSaveThemeTemplate,
  saveThemeTemplateInputSchema,
} from "./handleSaveThemeTemplate";

export const themeRouter = {
  listThemeTemplates: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/themeTemplates",
      summary: "List theme templates",
      tags: ["Theme template"],
    })
    .input(listThemeTemplatesInputSchema)
    .output(
      z.object({
        themeTemplates: z.array(
          themeTemplateSchema.pick({
            id: true,
            name: true,
            theme: true,
          }),
        ),
      }),
    )
    .handler(handleListThemeTemplates),

  saveThemeTemplate: authenticatedProcedure
    .route({
      method: "PUT",
      path: "/v1/themeTemplates/{themeTemplateId}",
      summary: "Save theme template",
      tags: ["Theme template"],
    })
    .input(saveThemeTemplateInputSchema)
    .output(
      z.object({
        themeTemplate: themeTemplateSchema,
      }),
    )
    .handler(handleSaveThemeTemplate),

  deleteThemeTemplate: authenticatedProcedure
    .route({
      method: "DELETE",
      path: "/v1/themeTemplates/{themeTemplateId}",
      summary: "Delete a theme template",
      tags: ["Theme template"],
    })
    .input(deleteThemeTemplateInputSchema)
    .output(
      z.object({
        themeTemplate: themeTemplateSchema,
      }),
    )
    .handler(handleDeleteThemeTemplate),
};
