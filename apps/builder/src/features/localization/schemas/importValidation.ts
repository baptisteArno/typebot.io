import { z } from "@typebot.io/zod";

// Schema for validating imported translation JSON
export const importedTranslationSchema = z.object({
  typebot: z.object({
    id: z.string(),
    name: z.string(),
    defaultLocale: z.string(),
    supportedLocales: z.array(z.string()),
  }),
  translations: z.array(
    z.object({
      blockId: z.string(),
      blockType: z.string(),
      groupTitle: z.string(),
      defaultContent: z.string(),
      translations: z.record(
        z.string(),
        z.object({
          content: z.string(),
          completeness: z.number().min(0).max(100),
        }),
      ),
    }),
  ),
  exportedAt: z.string(),
});

export type ImportedTranslationData = z.infer<typeof importedTranslationSchema>;

// Validation function with detailed error messages
export const validateImportedTranslations = (data: unknown) => {
  try {
    return {
      success: true as const,
      data: importedTranslationSchema.parse(data),
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });

      return {
        success: false as const,
        data: null,
        error: `Invalid JSON format:\n${errorMessages.join("\n")}`,
      };
    }

    return {
      success: false as const,
      data: null,
      error: "Unknown validation error occurred",
    };
  }
};
