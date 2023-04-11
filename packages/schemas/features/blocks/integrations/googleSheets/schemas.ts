import { z } from 'zod'
import { ComparisonOperators, LogicalOperator } from '../../logic/condition'
import { IntegrationBlockType } from '../enums'
import { GoogleSheetsAction } from './enums'
import { blockBaseSchema, credentialsBaseSchema } from '../../baseSchemas'

const cellSchema = z.object({
  column: z.string().optional(),
  value: z.string().optional(),
  id: z.string(),
})

const extractingCellSchema = z.object({
  column: z.string().optional(),
  id: z.string(),
  variableId: z.string().optional(),
})

const googleSheetsOptionsBaseSchema = z.object({
  credentialsId: z.string().optional(),
  sheetId: z.string().optional(),
  spreadsheetId: z.string().optional(),
})

const rowsFilterComparisonSchema = z.object({
  id: z.string(),
  column: z.string().optional(),
  comparisonOperator: z.nativeEnum(ComparisonOperators).optional(),
  value: z.string().optional(),
})

const initialGoogleSheetsOptionsSchema = googleSheetsOptionsBaseSchema.merge(
  z.object({
    action: z.undefined(),
  })
)

const googleSheetsGetOptionsSchema = googleSheetsOptionsBaseSchema.merge(
  z.object({
    action: z.enum([GoogleSheetsAction.GET]),
    // TODO: remove referenceCell once migrated to filtering
    referenceCell: cellSchema.optional(),
    filter: z
      .object({
        comparisons: z.array(rowsFilterComparisonSchema),
        logicalOperator: z.nativeEnum(LogicalOperator),
      })
      .optional(),
    cellsToExtract: z.array(extractingCellSchema),
  })
)

const googleSheetsInsertRowOptionsSchema = googleSheetsOptionsBaseSchema.merge(
  z.object({
    action: z.enum([GoogleSheetsAction.INSERT_ROW]),
    cellsToInsert: z.array(cellSchema),
  })
)

const googleSheetsUpdateRowOptionsSchema = googleSheetsOptionsBaseSchema.merge(
  z.object({
    action: z.enum([GoogleSheetsAction.UPDATE_ROW]),
    cellsToUpsert: z.array(cellSchema),
    referenceCell: cellSchema.optional(),
  })
)

export const googleSheetsOptionsSchema = z.discriminatedUnion('action', [
  googleSheetsGetOptionsSchema,
  googleSheetsInsertRowOptionsSchema,
  googleSheetsUpdateRowOptionsSchema,
  initialGoogleSheetsOptionsSchema,
])

export const googleSheetsBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.GOOGLE_SHEETS]),
    options: googleSheetsOptionsSchema,
  })
)

export const googleSheetsCredentialsSchema = z
  .object({
    type: z.literal('google sheets'),
    data: z.object({
      refresh_token: z.string().nullish(),
      expiry_date: z.number().nullish(),
      access_token: z.string().nullish(),
      token_type: z.string().nullish(),
      id_token: z.string().nullish(),
      scope: z.string().optional(),
    }),
  })
  .merge(credentialsBaseSchema)

export const defaultGoogleSheetsOptions: GoogleSheetsOptions = {}

export const defaultGoogleSheetsGetOptions = (
  createId: () => string
): GoogleSheetsGetOptions => ({
  action: GoogleSheetsAction.GET,
  cellsToExtract: [
    {
      id: createId(),
    },
  ],
})

export const defaultGoogleSheetsInsertOptions = (
  createId: () => string
): GoogleSheetsInsertRowOptions => ({
  action: GoogleSheetsAction.INSERT_ROW,
  cellsToInsert: [
    {
      id: createId(),
    },
  ],
})

export const defaultGoogleSheetsUpdateOptions = (
  createId: () => string
): GoogleSheetsUpdateRowOptions => ({
  action: GoogleSheetsAction.UPDATE_ROW,
  cellsToUpsert: [
    {
      id: createId(),
    },
  ],
})

export type GoogleSheetsBlock = z.infer<typeof googleSheetsBlockSchema>
export type GoogleSheetsOptions = z.infer<typeof googleSheetsOptionsSchema>
export type GoogleSheetsOptionsBase = z.infer<
  typeof googleSheetsOptionsBaseSchema
>
export type GoogleSheetsGetOptions = z.infer<
  typeof googleSheetsGetOptionsSchema
>
export type GoogleSheetsInsertRowOptions = z.infer<
  typeof googleSheetsInsertRowOptionsSchema
>
export type GoogleSheetsUpdateRowOptions = z.infer<
  typeof googleSheetsUpdateRowOptionsSchema
>
export type Cell = z.infer<typeof cellSchema>
export type ExtractingCell = z.infer<typeof extractingCellSchema>
export type RowsFilterComparison = z.infer<typeof rowsFilterComparisonSchema>
export type GoogleSheetsCredentials = z.infer<
  typeof googleSheetsCredentialsSchema
>
