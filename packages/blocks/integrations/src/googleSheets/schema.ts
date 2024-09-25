import {
  blockBaseSchema,
  credentialsBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import {
  ComparisonOperators,
  LogicalOperator,
} from "@typebot.io/conditions/constants";
import { z } from "@typebot.io/zod";
import { IntegrationBlockType } from "../constants";
import { GoogleSheetsAction, totalRowsToExtractOptions } from "./constants";

const cellSchema = z.object({
  column: z.string().optional(),
  value: z.string().optional(),
  id: z.string(),
});

const extractingCellSchema = z.object({
  column: z.string().optional(),
  id: z.string(),
  variableId: z.string().optional(),
});

const googleSheetsOptionsBaseSchema = z.object({
  credentialsId: z.string().optional(),
  sheetId: z.string().optional(),
  spreadsheetId: z.string().optional(),
});

const rowsFilterComparisonSchema = z.object({
  id: z.string(),
  column: z.string().optional(),
  comparisonOperator: z.nativeEnum(ComparisonOperators).optional(),
  value: z.string().optional(),
});

const initialGoogleSheetsOptionsSchema = googleSheetsOptionsBaseSchema.merge(
  z.object({
    action: z.undefined(),
  }),
);

const googleSheetsGetOptionsV5Schema = googleSheetsOptionsBaseSchema.merge(
  z.object({
    action: z.enum([GoogleSheetsAction.GET]),
    referenceCell: cellSchema.optional().optional(),
    filter: z
      .object({
        comparisons: z.array(rowsFilterComparisonSchema).optional(),
        logicalOperator: z.nativeEnum(LogicalOperator).optional(),
      })
      .optional(),
    cellsToExtract: z.array(extractingCellSchema).optional(),
    totalRowsToExtract: z.enum(totalRowsToExtractOptions).optional(),
  }),
);

const googleSheetsGetOptionsSchemas = {
  v5: googleSheetsGetOptionsV5Schema,
  v6: googleSheetsGetOptionsV5Schema.omit({
    referenceCell: true,
  }),
};

const googleSheetsGetOptionsSchema = z.union([
  googleSheetsGetOptionsSchemas.v5,
  googleSheetsGetOptionsSchemas.v6,
]);

const googleSheetsInsertRowOptionsSchema = googleSheetsOptionsBaseSchema.merge(
  z.object({
    action: z.enum([GoogleSheetsAction.INSERT_ROW]),
    cellsToInsert: z.array(cellSchema).optional(),
  }),
);

const googleSheetsUpdateRowOptionsV5Schema =
  googleSheetsOptionsBaseSchema.merge(
    z.object({
      action: z.enum([GoogleSheetsAction.UPDATE_ROW]),
      cellsToUpsert: z.array(cellSchema).optional(),
      referenceCell: cellSchema.optional(),
      filter: z
        .object({
          comparisons: z.array(rowsFilterComparisonSchema).optional(),
          logicalOperator: z.nativeEnum(LogicalOperator).optional(),
        })
        .optional(),
    }),
  );

const googleSheetsUpdateRowOptionsSchemas = {
  v5: googleSheetsUpdateRowOptionsV5Schema,
  v6: googleSheetsUpdateRowOptionsV5Schema.omit({
    referenceCell: true,
  }),
};

const googleSheetsUpdateRowOptionsSchema = z.union([
  googleSheetsUpdateRowOptionsSchemas.v5,
  googleSheetsUpdateRowOptionsSchemas.v6,
]);

export const googleSheetsOptionsSchemas = {
  v5: z.discriminatedUnion("action", [
    googleSheetsGetOptionsSchemas.v5,
    googleSheetsInsertRowOptionsSchema,
    googleSheetsUpdateRowOptionsSchemas.v5,
    initialGoogleSheetsOptionsSchema,
  ]),
  v6: z.discriminatedUnion("action", [
    googleSheetsGetOptionsSchemas.v6,
    googleSheetsInsertRowOptionsSchema,
    googleSheetsUpdateRowOptionsSchemas.v6,
    initialGoogleSheetsOptionsSchema,
  ]),
};

export const googleSheetsBlockV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.GOOGLE_SHEETS]),
    options: googleSheetsOptionsSchemas.v5.optional(),
  }),
);

export const googleSheetsBlockSchemas = {
  v5: googleSheetsBlockV5Schema,
  v6: googleSheetsBlockV5Schema
    .merge(
      z.object({
        options: googleSheetsOptionsSchemas.v6.optional(),
      }),
    )
    .openapi({
      title: "Google Sheets",
      ref: "googleSheetsBlock",
    }),
};

export const googleSheetsBlockSchema = z.union([
  googleSheetsBlockSchemas.v5,
  googleSheetsBlockSchemas.v6,
]);

export const googleSheetsCredentialsSchema = z
  .object({
    type: z.literal("google sheets"),
    data: z.object({
      refresh_token: z.string().nullish(),
      expiry_date: z.number().nullish(),
      access_token: z.string().nullish(),
      token_type: z.string().nullish(),
      id_token: z.string().nullish(),
      scope: z.string().optional(),
    }),
  })
  .merge(credentialsBaseSchema);

export type GoogleSheetsBlock = z.infer<typeof googleSheetsBlockSchema>;
export type GoogleSheetsBlockV5 = z.infer<typeof googleSheetsBlockSchemas.v5>;
export type GoogleSheetsBlockV6 = z.infer<typeof googleSheetsBlockSchemas.v6>;
export type GoogleSheetsOptionsBase = z.infer<
  typeof googleSheetsOptionsBaseSchema
>;
export type GoogleSheetsGetOptions = z.infer<
  typeof googleSheetsGetOptionsSchema
>;
export type GoogleSheetsGetOptionsV6 = z.infer<
  typeof googleSheetsGetOptionsSchemas.v6
>;
export type GoogleSheetsInsertRowOptions = z.infer<
  typeof googleSheetsInsertRowOptionsSchema
>;
export type GoogleSheetsUpdateRowOptions = z.infer<
  typeof googleSheetsUpdateRowOptionsSchema
>;
export type GoogleSheetsUpdateRowOptionsV6 = z.infer<
  typeof googleSheetsUpdateRowOptionsSchemas.v6
>;
export type Cell = z.infer<typeof cellSchema>;
export type ExtractingCell = z.infer<typeof extractingCellSchema>;
export type RowsFilterComparison = z.infer<typeof rowsFilterComparisonSchema>;
export type GoogleSheetsCredentials = z.infer<
  typeof googleSheetsCredentialsSchema
>;
